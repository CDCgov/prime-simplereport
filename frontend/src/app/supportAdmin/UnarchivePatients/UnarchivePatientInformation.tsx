import React from "react";
import moment from "moment";

import {
  PATIENT_TERM_CAP,
  PATIENT_TERM_PLURAL,
} from "../../../config/constants";
import { displayFullName } from "../../utils";
import Button from "../../commonComponents/Button/Button";
import Pagination from "../../commonComponents/Pagination";

import {
  UnarchivePatientPatient,
  UnarchivePatientState,
} from "./UnarchivePatient";

interface UnarchivePatientInformationProps {
  unarchivePatientState: UnarchivePatientState;
  currentPage: number;
  loading: boolean;
  handlePaginationClick: (pageNumber: number) => void;
}
const UnarchivePatientInformation = ({
  unarchivePatientState,
  currentPage,
  loading,
  handlePaginationClick,
}: UnarchivePatientInformationProps) => {
  const displayInstructions =
    unarchivePatientState.patients === undefined &&
    unarchivePatientState.patientsCount === undefined;

  const patientRows = () => {
    if (displayPagination()) {
      return unarchivePatientState.patients?.map(
        (patient: UnarchivePatientPatient) => {
          let fullName = displayFullName(
            patient.firstName,
            patient.middleName,
            patient.lastName
          );

          return (
            <tr key={patient.internalId} data-testid="sr-archived-patient-row">
              <td>{fullName}</td>
              <td>{moment(patient.birthDate).format("MM/DD/yyyy")}</td>
              <td>
                {patient.facility ? patient.facility.name : "All facilities"}
              </td>
              <td>
                {/*Need to update in #6064*/}
                <Button
                  type="button"
                  label="Unarchive"
                  aria-label={`Unarchive ${fullName}`}
                />
              </td>
            </tr>
          );
        }
      );
    } else {
      return (
        <tr>
          <td colSpan={5}>No results</td>
        </tr>
      );
    }
  };
  const setInstructions = () => {
    if (
      unarchivePatientState.orgId !== "" &&
      unarchivePatientState.facilities.length === 0
    ) {
      return "This organization has no facilities. Select a different organization.";
    } else {
      return "Filter by organization and testing facility to display archived patients.";
    }
  };

  const displayFacilityName = () => {
    let selectedFacility = unarchivePatientState.facilities.find((f) => {
      return f.id === unarchivePatientState.facilityId;
    });
    let name = selectedFacility?.name;
    let facilityNameText = name ? ` for ${name}` : "";
    return `Archived ${PATIENT_TERM_PLURAL}${facilityNameText}`;
  };

  const displayPagination = () => {
    if (
      !loading &&
      unarchivePatientState.patients &&
      unarchivePatientState.patientsCount
    ) {
      return (
        unarchivePatientState.patientsCount > 0 &&
        unarchivePatientState.patients.length > 0
      );
    } else {
      return false;
    }
  };

  return (
    <div className="prime-container card-container" aria-live={"polite"}>
      {loading && <div className="width-full margin-4">Loading...</div>}
      {displayInstructions && !loading && (
        <div className="width-full margin-4">{setInstructions()}</div>
      )}
      {!displayInstructions && !loading && (
        <div className="usa-card__header display-block">
          <div className="display-flex flex-wrap flex-row">
            <h2 className="margin-right-4 margin-bottom-1">
              {displayFacilityName()}
            </h2>
            <div className="sr-showing-patients-on-page display-flex flex-align-center">
              {loading && "Loading..."}
              {displayPagination() && (
                <>
                  Showing{" "}
                  {(currentPage - 1) * unarchivePatientState.entriesPerPage + 1}
                  -
                  {Math.min(
                    unarchivePatientState.entriesPerPage * currentPage,
                    unarchivePatientState.patientsCount ?? 0
                  )}{" "}
                  of {unarchivePatientState.patientsCount}
                </>
              )}
            </div>
          </div>
          <div className=" sr-patient-list">
            <table className="usa-table usa-table--borderless width-full">
              <thead>
                <tr>
                  <th scope="col">{PATIENT_TERM_CAP}</th>
                  <th scope="col">Date of birth</th>
                  <th scope="col">Testing facility</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody aria-live="polite">{patientRows()}</tbody>
            </table>
          </div>
          {displayPagination() && (
            <div className="usa-card__footer">
              <Pagination
                baseRoute={unarchivePatientState.pageUrl}
                currentPage={currentPage}
                entriesPerPage={unarchivePatientState.entriesPerPage}
                totalEntries={unarchivePatientState.patientsCount ?? 0}
                onPaginationClick={handlePaginationClick}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UnarchivePatientInformation;
