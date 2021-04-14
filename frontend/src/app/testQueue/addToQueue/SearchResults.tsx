import React, { useState } from "react";

import Button from "../../commonComponents/Button";
import AoEModalForm from "../AoEForm/AoEModalForm";
import { displayFullName } from "../../utils";

interface SearchResultsProps {
  patients: any[]; //TODO TYPE: Patient
  onAddToQueue: (a: any, b: any, c: string) => string; //TODO TYPE: Patient, answers
  facilityId: string;
  patientsInQueue: string[];
  shouldShowSuggestions: boolean;
  loading: boolean;
}

const SearchResults = ({
  patients,
  onAddToQueue,
  facilityId,
  patientsInQueue,
  shouldShowSuggestions,
  loading,
}: SearchResultsProps) => {
  const [dialogPatient, setDialogPatient] = useState(null);
  const [canAddToQueue, setCanAddToQueue] = useState(false);

  const canAddToTestQueue = (patientId = "") => {
    return patientsInQueue.indexOf(patientId) === -1;
  };
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
                      {canAddToTestQueue(p.internalId) ? (
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
      {dialogPatient !== null && (
        <AoEModalForm
          saveButtonText="Continue"
          patient={dialogPatient}
          onClose={() => {
            setDialogPatient(null);
          }}
          saveCallback={(a: any) =>
            onAddToQueue(dialogPatient, a, canAddToQueue ? "create" : "update")
          }
        />
      )}
      {shouldShowSuggestions && results}
    </>
  );
};

export default SearchResults;
