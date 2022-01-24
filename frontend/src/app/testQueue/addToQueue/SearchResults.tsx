import React, { useEffect, useState } from "react";
import moment from "moment";
import { Navigate, useLocation } from "react-router-dom";

import Button from "../../commonComponents/Button/Button";
import AoEModalForm from "../AoEForm/AoEModalForm";
import { displayFullName } from "../../utils";
import { Patient } from "../../patients/ManagePatients";
import { AoEAnswersDelivery } from "../AoEForm/AoEForm";
import { getFacilityIdFromUrl } from "../../utils/url";

interface SearchResultsProps {
  patients: Patient[];
  shouldShowSuggestions: boolean;
  loading: boolean;
  dropDownRef?: React.RefObject<HTMLDivElement>;
  selectedPatient?: Patient;
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

  if (redirect) {
    return <Navigate to={redirect} />;
  }

  const actionByPage = (patient: Patient, idx: Number) => {
    if (props.page === "queue") {
      const canAddToTestQueue =
        props.patientsInQueue.indexOf(patient.internalId) === -1;
      return canAddToTestQueue ? (
        <Button
          variant="unstyled"
          label="Begin test"
          ariaDescribedBy={`name${idx} birthdate${idx}`}
          onClick={() => {
            setDialogPatient(patient);
            setCanAddToQueue(canAddToTestQueue);
          }}
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
          Check for spelling errors or
          <Button
            className="margin-left-1"
            label="Add new patient"
            onClick={() => {
              setRedirect(`/add-patient?facility=${activeFacilityId}`);
            }}
          />
        </div>
      </div>
    );
  } else {
    resultsContent = (
      <table className="usa-table usa-table--borderless">
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
    <div className="card-container shadow-3 results-dropdown" ref={dropDownRef}>
      <div className="usa-card__body results-dropdown__body">
        {resultsContent}
      </div>
    </div>
  );

  return (
    <>
      {props.page === "queue" && dialogPatient !== null && (
        <AoEModalForm
          patient={dialogPatient}
          onClose={() => {
            setDialogPatient(null);
          }}
          saveCallback={(a: any) =>
            props.onAddToQueue(
              dialogPatient,
              a,
              canAddToQueue ? "create" : "update"
            )
          }
        />
      )}
      {shouldShowSuggestions && results}
    </>
  );
};

export default SearchResults;
