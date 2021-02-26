import { gql, useQuery } from "@apollo/client";
import React, { useState } from "react";
import moment from "moment";
import { displayFullName } from "../utils";
import classnames from "classnames";
import { PATIENT_TERM, PATIENT_TERM_PLURAL_CAP } from "../../config/constants";
import { daysSince } from "../utils/date";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PatientUpload from "./PatientUpload";
import { LinkWithQuery } from "../commonComponents/LinkWithQuery";
import ArchivePersonModal from "./ArchivePersonModal";
import { Menu, MenuButton, MenuItem } from "@szhsin/react-menu";
import { faEllipsisH } from "@fortawesome/free-solid-svg-icons";
import {
  InjectedQueryWrapperProps,
  QueryWrapper,
} from "../commonComponents/QueryWrapper";
import "./ManagePatients.scss";
import { useSelector } from "react-redux";
import Pagination from "../commonComponents/Pagination";

const patientsCountQuery = gql`
  query GetPatientsCountByFacility(
    $facilityId: String!
    $showDeleted: Boolean!
  ) {
    patientsCount(facilityId: $facilityId, showDeleted: $showDeleted)
  }
`;

const patientQuery = gql`
  query GetPatientsByFacility(
    $facilityId: String!
    $pageNumber: Int!
    $pageSize: Int!
    $showDeleted: Boolean
  ) {
    patients(
      facilityId: $facilityId
      pageNumber: $pageNumber
      pageSize: $pageSize
      showDeleted: $showDeleted
    ) {
      internalId
      firstName
      lastName
      middleName
      birthDate
      isDeleted
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
  lastTest: {
    dateAdded: string;
  };
}

interface Props {
  activeFacilityId: string;
  canEditUser: boolean;
  canDeleteUser: boolean;
  currentPage?: number;
  pageCount: number;
  entriesPerPage?: number;
  showDeleted?: boolean;
  data: { patients: Patient[] };
  refetch: () => null;
}

export const DetachedManagePatients = ({
  activeFacilityId,
  canEditUser,
  data,
  currentPage = 1,
  pageCount,
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

      let editUserLink =
        canEditUser && !patient.isDeleted ? (
          <LinkWithQuery to={`/patient/${patient.internalId}`}>
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
          <td> {patient.birthDate}</td>
          <td>
            {patient.lastTest
              ? `${daysSince(moment(patient.lastTest.dateAdded))}`
              : "N/A"}
          </td>
          <td>
            {canEditUser && !patient.isDeleted && (
              <Menu
                menuButton={
                  <MenuButton className="sr-modal-menu-button">
                    <FontAwesomeIcon icon={faEllipsisH} size="2x" />
                    <span className="usa-sr-only">More actions</span>
                  </MenuButton>
                }
              >
                <MenuItem onClick={() => setArchivePerson(patient)}>
                  Archive this record
                </MenuItem>
              </Menu>
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
                {pageCount > 0 ? ` (Page {currentPage} of {pageCount})` : ""}
              </h2>
              {canEditUser ? (
                <LinkWithQuery
                  className="usa-button usa-button--outline"
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
                    <th scope="col">Days since last test</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>{patientRows(data.patients)}</tbody>
              </table>
            </div>
          </div>
          <PatientUpload onSuccess={refetch} />
        </div>
      </div>
    </main>
  );
};

const ManagePatients = (
  props: Omit<Props, InjectedQueryWrapperProps | "pageCount">
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

  const entriesPerPage = props.entriesPerPage || 20;
  const pageCount = Math.ceil(totalPatients.patientsCount / entriesPerPage);
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
        pageCount,
      }}
    >
      <Pagination
        baseRoute="/patients"
        currentPage={pageNumber}
        entriesPerPage={entriesPerPage}
        totalEntries={totalPatients.patientsCount}
        className="prime-home padding-bottom-5"
      />
    </QueryWrapper>
  );
};

export default ManagePatients;
