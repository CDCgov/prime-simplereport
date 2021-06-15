import React, { useState } from "react";
import moment from "moment";

import Button from "../../commonComponents/Button/Button";
import AoEModalForm from "../AoEForm/AoEModalForm";
import { displayFullName } from "../../utils";
import { Patient } from "../../patients/ManagePatients";
import { AoEAnswersDelivery } from "../AoEForm/AoEForm";

interface SearchResultsProps {
  patients: Patient[];
  shouldShowSuggestions: boolean;
  loading: boolean;
  dropDownRef?: React.RefObject<HTMLDivElement>;
}

interface QueueProps extends SearchResultsProps {
  page: "queue";
  onAddToQueue: (
    a: Patient,
    b: AoEAnswersDelivery,
    c: string
  ) => Promise<string | void>;
  patientsInQueue: string[];
}

interface TestResultsProps extends SearchResultsProps {
  page: "test-results";
  onPatientSelect: (a: Patient) => void;
}

const SearchResults = (props: QueueProps | TestResultsProps) => {
  const { patients, shouldShowSuggestions, loading, dropDownRef } = props;

  const [dialogPatient, setDialogPatient] = useState<Patient | null>(null);
  const [canAddToQueue, setCanAddToQueue] = useState(false);

  const actionByPage = (patient: Patient) => {
    if (props.page === "queue") {
      const canAddToTestQueue =
        props.patientsInQueue.indexOf(patient.internalId) === -1;
      return canAddToTestQueue ? (
        <Button
          variant="unstyled"
          label="Begin test"
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
    resultsContent = <p>No results</p>;
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
          {patients.map((p) => (
            <tr key={p.internalId}>
              <td>{displayFullName(p.firstName, p.middleName, p.lastName)}</td>
              <td>{moment(p.birthDate).format("MM/DD/YYYY")}</td>
              <td>{actionByPage(p)}</td>
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
          saveButtonText="Continue"
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
