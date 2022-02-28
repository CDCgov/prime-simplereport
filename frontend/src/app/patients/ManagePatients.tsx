import { gql, useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import moment from "moment";
import classnames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSlidersH } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

import { displayFullName } from "../utils";
import { PATIENT_TERM, PATIENT_TERM_PLURAL_CAP } from "../../config/constants";
import { daysSince } from "../utils/date";
import { capitalizeText } from "../utils/text";
import { LinkWithQuery } from "../commonComponents/LinkWithQuery";
import { ActionsMenu } from "../commonComponents/ActionsMenu";
import {
  InjectedQueryWrapperProps,
  QueryWrapper,
} from "../commonComponents/QueryWrapper";
import Pagination from "../commonComponents/Pagination";
import { useDebounce } from "../testQueue/addToQueue/useDebounce";
import { SEARCH_DEBOUNCE_TIME } from "../testQueue/constants";
import Button from "../commonComponents/Button/Button";
import SearchInput from "../testQueue/addToQueue/SearchInput";
import { TestResult as TestResultType } from "../../app/testQueue/QueueItem";

import PatientUpload from "./PatientUpload";
import ArchivePersonModal from "./ArchivePersonModal";

import "./ManagePatients.scss";

export const patientsCountQuery = gql`
  query GetPatientsCountByFacility(
    $facilityId: ID!
    $showDeleted: Boolean!
    $namePrefixMatch: String
  ) {
    patientsCount(
      facilityId: $facilityId
      showDeleted: $showDeleted
      namePrefixMatch: $namePrefixMatch
    )
  }
`;

export const patientQuery = gql`
  query GetPatientsByFacility(
    $facilityId: ID!
    $pageNumber: Int!
    $pageSize: Int!
    $showDeleted: Boolean
    $namePrefixMatch: String
  ) {
    patients(
      facilityId: $facilityId
      pageNumber: $pageNumber
      pageSize: $pageSize
      showDeleted: $showDeleted
      namePrefixMatch: $namePrefixMatch
    ) {
      internalId
      firstName
      lastName
      middleName
      birthDate
      isDeleted
      role
      lastTest {
        dateAdded
      }
    }
  }
`;

export interface Patient {
  internalId: string;
  firstName: string;
  lastName: string;
  middleName: string;
  birthDate: string;
  isDeleted: boolean;
  role: string;
  lastTest: {
    dateAdded: string;
    result: TestResultType;
    dateTested: string;
    deviceTypeModel: string;
    deviceTypeName: string;
    facilityName: string;
  };
}

interface Props {
  activeFacilityId: string;
  canEditUser: boolean;
  canDeleteUser: boolean;
  currentPage: number;
  entriesPerPage: number;
  totalEntries?: number;
  showDeleted?: boolean;
  data?: { patients: Patient[] };
  refetch: () => null;
  setNamePrefixMatch: (namePrefixMatch: string | null) => void;
  isAdmin: boolean;
}

export const DetachedManagePatients = ({
  canEditUser,
  data,
  currentPage,
  entriesPerPage,
  totalEntries,
  refetch,
  setNamePrefixMatch,
  isAdmin,
  activeFacilityId,
}: Props) => {
  const [archivePerson, setArchivePerson] = useState<Patient | null>(null);
  const navigate = useNavigate();

  const [queryString, debounced, setDebounced] = useDebounce<string | null>(
    null,
    {
      debounceTime: SEARCH_DEBOUNCE_TIME,
    }
  );

  useEffect(() => {
    if (queryString && queryString.length > 1) {
      setNamePrefixMatch(queryString);
    } else if (!queryString) {
      setNamePrefixMatch(null);
    }
    navigate({
      search: `?facility=${activeFacilityId}`,
    });
  }, [queryString, setNamePrefixMatch, navigate, activeFacilityId]);

  if (archivePerson) {
    return (
      <ArchivePersonModal
        person={archivePerson}
        closeModal={() => {
          setArchivePerson(null);
          refetch();
        }}
      />
    );
  }

  const patientRows = (patients: Patient[]) => {
    if (patients.length === 0) {
      return (
        <tr>
          <td colSpan={5}>No results</td>
        </tr>
      );
    }

    return patients.map((patient: Patient) => {
      let fullName = displayFullName(
        patient.firstName,
        patient.middleName,
        patient.lastName
      );

      const editUserLink =
        canEditUser && !patient.isDeleted ? (
          <LinkWithQuery
            to={`/patient/${patient.internalId}`}
            className="sr-patient-edit-link"
          >
            {fullName}
          </LinkWithQuery>
        ) : (
          <span>{fullName}</span>
        );

      return (
        <tr
          key={patient.internalId}
          className={classnames(
            "sr-patient-row",
            patient.isDeleted && "sr-patient-row--removed"
          )}
        >
          <th scope="row">{editUserLink}</th>
          <td>{moment(patient.birthDate).format("MM/DD/yyyy")}</td>
          <td>{capitalizeText(patient.role)}</td>
          <td>
            {patient.lastTest
              ? `${daysSince(moment(patient.lastTest.dateAdded))}`
              : "N/A"}
          </td>
          <td>
            {canEditUser && !patient.isDeleted && (
              <ActionsMenu
                items={[
                  {
                    name: "Archive record",
                    action: () => setArchivePerson(patient),
                  },
                ]}
              />
            )}
          </td>
        </tr>
      );
    });
  };

  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="grid-row">
          <div className="prime-container card-container">
            <div className="usa-card__header">
              <h2>
                {PATIENT_TERM_PLURAL_CAP}
                <span className="sr-showing-patients-on-page">
                  {totalEntries === undefined ? (
                    "Loading..."
                  ) : (
                    <>
                      Showing {(currentPage - 1) * entriesPerPage + 1}-
                      {Math.min(entriesPerPage * currentPage, totalEntries)} of{" "}
                      {totalEntries}
                    </>
                  )}
                </span>
              </h2>
              <div>
                <Button
                  className="sr-active-button"
                  icon={faSlidersH}
                  onClick={() => {
                    setNamePrefixMatch(null);
                    setDebounced(null);
                  }}
                >
                  Clear filters
                </Button>
                {canEditUser ? (
                  <LinkWithQuery
                    className="usa-button usa-button--primary"
                    to={`/add-patient`}
                    id="add-patient-button"
                  >
                    <FontAwesomeIcon icon="plus" />
                    {` Add ${PATIENT_TERM}`}
                  </LinkWithQuery>
                ) : null}
              </div>
            </div>
            <div className="display-flex flex-row bg-base-lightest padding-x-3 padding-y-2">
              <SearchInput
                label="Person"
                onInputChange={(e) => {
                  setDebounced(e.target.value);
                }}
                onSearchClick={(e) => {
                  e.preventDefault();
                  setNamePrefixMatch(debounced);
                }}
                queryString={debounced || ""}
                className="display-inline-block"
                placeholder=""
                focusOnMount
              />
            </div>
            <div className="usa-card__body sr-patient-list">
              <table className="usa-table usa-table--borderless width-full">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Date of birth</th>
                    <th scope="col">Type</th>
                    <th scope="col">Days since last test</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody aria-live="polite">
                  {data ? (
                    patientRows(data.patients)
                  ) : (
                    <tr>
                      <td colSpan={5}>Loading...</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {data?.patients && data.patients.length > 0 && (
              <div className="usa-card__footer">
                {totalEntries && (
                  <Pagination
                    baseRoute="/patients"
                    currentPage={currentPage}
                    entriesPerPage={entriesPerPage}
                    totalEntries={totalEntries}
                  />
                )}
              </div>
            )}
          </div>
          {isAdmin && <PatientUpload onSuccess={refetch} />}
        </div>
      </div>
    </main>
  );
};

type InjectedContainerProps =
  | "pageCount"
  | "entriesPerPage"
  | "totalEntries"
  | "setNamePrefixMatch";

const ManagePatients = (
  props: Omit<Props, InjectedQueryWrapperProps | InjectedContainerProps>
) => {
  const [namePrefixMatch, setNamePrefixMatch] = useState<string | null>(null);

  const { data: totalPatients, error, refetch: refetchCount } = useQuery(
    patientsCountQuery,
    {
      variables: {
        facilityId: props.activeFacilityId,
        showDeleted: false,
        namePrefixMatch,
      },
      fetchPolicy: "no-cache",
    }
  );

  if (props.activeFacilityId.length < 1) {
    return <div>"No facility selected"</div>;
  }

  if (error) {
    throw error;
  }

  const totalEntries = totalPatients?.patientsCount;
  const entriesPerPage = 20;
  const pageNumber = props.currentPage || 1;
  return (
    <QueryWrapper<Props>
      query={patientQuery}
      queryOptions={{
        variables: {
          facilityId: props.activeFacilityId,
          pageNumber: pageNumber - 1,
          pageSize: entriesPerPage,
          showDeleted: props.showDeleted || false,
          namePrefixMatch,
        },
      }}
      onRefetch={refetchCount}
      Component={DetachedManagePatients}
      displayLoadingIndicator={false}
      componentProps={{
        ...props,
        totalEntries,
        currentPage: pageNumber,
        entriesPerPage,
        setNamePrefixMatch,
      }}
    />
  );
};

export default ManagePatients;
