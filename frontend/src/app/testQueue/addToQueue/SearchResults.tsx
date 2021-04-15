import React, { useState } from "react";

import Button from "../../commonComponents/Button";
import AoEModalForm from "../AoEForm/AoEModalForm";
import { displayFullName } from "../../utils";
import { Patient } from "../../patients/ManagePatients";

interface SearchResultsProps {
  patients: Patient[];
  shouldShowSuggestions: boolean;
  loading: boolean;
}

interface QueueProps extends SearchResultsProps {
  page: "queue";
  onAddToQueue: (a: Patient, b: any, c: string) => string; //TODO TYPE: answers (b)
  patientsInQueue: string[];
}

interface TestResultsProps extends SearchResultsProps {
  page: "test-results";
  onPatientSelect: (a: Patient) => void;
}

const SearchResults = (props: QueueProps | TestResultsProps) => {
  const { patients, shouldShowSuggestions, loading } = props;

  const [dialogPatient, setDialogPatient] = useState<Patient | null>(null);
  const [canAddToQueue, setCanAddToQueue] = useState(false);

  const canAddToTestQueue =
    props.page === "queue"
      ? (patientId = "") => {
          return props.patientsInQueue.indexOf(patientId) === -1;
        }
      : () => false;
  let results;

  if (!shouldShowSuggestions) {
    results = null;
  } else {
    results = (
      <div className="card-container shadow-3 results-dropdown">
        <div className="usa-card__body">
          {loading ? (
            <p>Searching...</p>
          ) : patients.length === 0 ? (
            <p>No results</p>
          ) : (
            <table className="usa-table usa-table--borderless">
              <thead>
                <tr>
                  <th scope="col">Full name</th>
                  <th scope="col">Date of birth</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.internalId}>
                    <td>
                      {displayFullName(p.firstName, p.middleName, p.lastName)}
                    </td>
                    <td>{p.birthDate}</td>
                    <td>
                      {props.page === "queue" ? (
                        canAddToTestQueue(p.internalId) ? (
                          <Button
                            variant="unstyled"
                            label="Begin test"
                            onClick={() => {
                              setDialogPatient(p);
                              setCanAddToQueue(canAddToTestQueue(p.internalId));
                            }}
                          />
                        ) : (
                          "Test in progress"
                        )
                      ) : (
                        <Button
                          variant="unstyled"
                          label="Get test results"
                          onClick={() => {
                            props.onPatientSelect(p);
                          }}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

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
