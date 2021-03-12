import { gql, useQuery } from "@apollo/client";
import React, { useState } from "react";
import moment from "moment";
import classnames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelector } from "react-redux";

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

import PatientUpload from "./PatientUpload";
import ArchivePersonModal from "./ArchivePersonModal";

import "./ManagePatients.scss";

const patientsCountQuery = gql`
  query GetPatientsCountByFacility($facilityId: ID!, $showDeleted: Boolean!) {
    patientsCount(facilityId: $facilityId, showDeleted: $showDeleted)
  }
`;

const patientQuery = gql`
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
  };
}

interface Props {
  activeFacilityId: string;
  canEditUser: boolean;
  canDeleteUser: boolean;
  currentPage?: number;
  entriesPerPage: number;
  totalEntries: number;
  showDeleted?: boolean;
  data: { patients: Patient[] };
  refetch: () => null;
}

export const DetachedManagePatients = ({
  canEditUser,
  data,
  currentPage = 1,
  entriesPerPage,
  totalEntries,
  refetch,
}: Props) => {
  const [archivePerson, setArchivePerson] = useState<Patient | null>(null);

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
          <div className="prime-container usa-card__container">
            <div className="usa-card__header">
              <h2>
                {PATIENT_TERM_PLURAL_CAP}
                <span className="sr-showing-patients-on-page">
                  Showing {Math.min(entriesPerPage, totalEntries)} of{" "}
                  {totalEntries}
                </span>
              </h2>
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
            <div className="usa-card__body sr-patient-list">
              <table className="usa-table usa-table--borderless width-full">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Date of Birth</th>
                    <th scope="col">Type</th>
                    <th scope="col">Days since last test</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>{patientRows(data.patients)}</tbody>
              </table>
            </div>
            <div className="usa-card__footer">
              <Pagination
                baseRoute="/patients"
                currentPage={currentPage}
                entriesPerPage={entriesPerPage}
                totalEntries={totalEntries}
              />
            </div>
          </div>
          <PatientUpload onSuccess={refetch} />
        </div>
      </div>
    </main>
  );
};

type InjectedContainerProps = "pageCount" | "entriesPerPage" | "totalEntries";

const ManagePatients = (
  props: Omit<Props, InjectedQueryWrapperProps | InjectedContainerProps>
) => {
  const activeFacilityId = useSelector(
    (state) => (state as any).facility.id as string
  );

  const {
    data: totalPatients,
    loading,
    error,
    refetch: refetchCount,
  } = useQuery(patientsCountQuery, {
    variables: { facilityId: activeFacilityId, showDeleted: false },
    fetchPolicy: "no-cache",
  });

  if (activeFacilityId.length < 1) {
    return <div>"No facility selected"</div>;
  }

  if (loading) {
    return <p>Loading</p>;
  }
  if (error) {
    throw error;
  }

  const totalEntries = totalPatients.patientsCount;
  const entriesPerPage = 20;
  const pageNumber = props.currentPage || 1;
  return (
    <QueryWrapper<Props>
      query={patientQuery}
      queryOptions={{
        variables: {
          facilityId: activeFacilityId,
          pageNumber: pageNumber - 1,
          pageSize: entriesPerPage,
          showDeleted: props.showDeleted || false,
        },
      }}
      onRefetch={refetchCount}
      Component={DetachedManagePatients}
      componentProps={{
        ...props,
        totalEntries,
        currentPage: pageNumber,
        entriesPerPage,
      }}
    />
  );
};

export default ManagePatients;
