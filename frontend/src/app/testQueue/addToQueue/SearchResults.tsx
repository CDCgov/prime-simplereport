import React, { useEffect, useState } from "react";
import moment from "moment";
import { Navigate, useLocation } from "react-router-dom";

import Button from "../../commonComponents/Button/Button";
import { displayFullName } from "../../utils";
import { Patient } from "../../patients/ManagePatients";
import { AoEAnswersDelivery } from "../AoEForm/AoEForm";
import { getFacilityIdFromUrl } from "../../utils/url";
import { PATIENT_TERM } from "../../../config/constants";

interface SearchResultsProps {
  patients: Patient[];
  shouldShowSuggestions: boolean;
  loading: boolean;
  dropDownRef?: React.RefObject<HTMLDivElement>;
  selectedPatient?: Patient;
  canAddPatient: boolean;
  addPatientToQueue?: (patient: Patient) => Promise<void>;
}

export interface QueueProps extends SearchResultsProps {
  page: "queue";
  onAddToQueue: (
    a: Patient,
    b: AoEAnswersDelivery,
    c: string
  ) => Promise<string | void>;
  patientsInQueue: string[];
}

export interface TestResultsProps extends SearchResultsProps {
  page: "test-results";
  onPatientSelect: (a: Patient) => void;
}

const SearchResults = (props: QueueProps | TestResultsProps) => {
  const {
    patients,
    shouldShowSuggestions,
    loading,
    dropDownRef,
    selectedPatient,
    addPatientToQueue,
  } = props;

  const [dialogPatient, setDialogPatient] = useState<Patient | null>(null);
  const [canAddToQueue, setCanAddToQueue] = useState(false);
  const [redirect, setRedirect] = useState<string | undefined>(undefined);

  const activeFacilityId = getFacilityIdFromUrl(useLocation());

  useEffect(() => {
    if (selectedPatient) {
      setDialogPatient(selectedPatient);
      setCanAddToQueue(true);
    }
  }, [selectedPatient]);

  function handleSaveCallback(a: any) {
    if (props.page === "queue" && dialogPatient !== null) {
      return props.onAddToQueue(
        dialogPatient,
        a,
        canAddToQueue ? "create" : "update"
      );
    }

    return Promise.resolve();
  }

  if (redirect) {
    return <Navigate to={redirect} />;
  }

  const handleBeginTestClick = (patient: Patient) => {
    if (addPatientToQueue) {
      return addPatientToQueue(patient);
    }

    // existing logic
    setDialogPatient(patient);
    // this will always be true because the "Begin test" button
    // is only available when canAddToTestQueue is true
    setCanAddToQueue(true);
  };

  const actionByPage = (patient: Patient, idx: Number) => {
    if (props.page === "queue") {
      const canAddToTestQueue =
        props.patientsInQueue.indexOf(patient.internalId) === -1;
      return canAddToTestQueue ? (
        <Button
          variant="unstyled"
          label="Begin test"
          ariaDescribedBy={`name${idx} birthdate${idx}`}
          onClick={() => handleBeginTestClick(patient)}
        />
      ) : (
        "Test in progress"
      );
    } else if (props.page === "test-results") {
      return (
        <Button
          variant="unstyled"
          label="Filter"
          onClick={() => {
            props.onPatientSelect(patient);
          }}
        />
      );
    }
    return "";
  };

  let resultsContent;
  if (loading) {
    resultsContent = <p>Searching...</p>;
  } else if (patients.length === 0) {
    resultsContent = (
      <div
        className={
          "display-flex flex-column flex-align-center margin-x-7 margin-y-2"
        }
      >
        <div className="margin-bottom-105">No results found.</div>
        <div>
          Check for spelling errors
          {props.canAddPatient ? (
            <>
              {" or"}
              <Button
                className="margin-left-1"
                label={`Add new ${PATIENT_TERM}`}
                onClick={() => {
                  setRedirect(`/add-patient?facility=${activeFacilityId}`);
                }}
              />
            </>
          ) : (
            "."
          )}
        </div>
      </div>
    );
  } else {
    resultsContent = (
      <table
        className="usa-table usa-table--borderless"
        aria-describedby={"patient-result-table-desc"}
      >
        <thead>
          <tr>
            <th scope="col">Full name</th>
            <th scope="col">Date of birth</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p, idx) => (
            <tr key={p.internalId}>
              <td id={`name${idx}`}>
                {displayFullName(p.firstName, p.middleName, p.lastName)}
              </td>
              <td id={`birthdate${idx}`}>
                {moment(p.birthDate).format("MM/DD/YYYY")}
              </td>
              <td>{actionByPage(p, idx)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  const results = (
    <div
      className="card-container shadow-3 results-dropdown"
      ref={dropDownRef}
      aria-live="polite"
      role="region"
      aria-atomic="true"
    >
      <div className="usa-sr-only" id={"patient-result-table-desc"}>
        patient search results
      </div>
      <div className="usa-card__body results-dropdown__body">
        {resultsContent}
      </div>
    </div>
  );

  return <>{shouldShowSuggestions && results}</>;
};

export default SearchResults;
