import React, { useState } from "react";
import Button from "../../commonComponents/Button";
import AoeModalForm from "../AoEForm/AoEModalForm";
import { displayFullName } from "../../utils";

interface SearchResultsProps {
  patients: any[]; //TODO TYPE: Patient
  onAddToQueue: (a: any, b: any, c: string) => string; //TODO TYPE: Patient, answers
  facilityId: string;
  patientsInQueue: string[];
  shouldShowSuggestions: boolean;
}

const SearchResults = ({
  patients,
  onAddToQueue,
  facilityId,
  patientsInQueue,
  shouldShowSuggestions,
}: SearchResultsProps) => {
  const [dialogPatient, setDialogPatient] = useState(null);
  const [canAddToQueue, setCanAddToQueue] = useState(false);

  const canAddToTestQueue = (patientId = "") => {
    return patientsInQueue.indexOf(patientId) === -1;
  };
  let results;
  if (patients.length === 0) {
    results = <h3> No results </h3>;
    if (canAddToQueue) setCanAddToQueue(false);
  } else {
    results = (
      <div className="usa-card__container shadow-3 results-dropdown">
        <div className="usa-card__body">
          <table className="usa-table usa-table--borderless">
            <thead>
              <tr>
                <th scope="col">Full name</th>
                <th scope="col">Date of Birth</th>
                <th scope="col">Unique ID</th>
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
                  <td>{p.lookupId}</td>
                  <td>
                    {canAddToTestQueue(p.internalId) ? (
                      <Button
                        variant="unstyled"
                        label="Begin Test"
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
        </div>
      </div>
    );
  }

  return (
    <>
      {dialogPatient !== null && (
        <AoeModalForm
          saveButtonText="Continue"
          patient={dialogPatient}
          onClose={() => {
            setDialogPatient(null);
          }}
          saveCallback={(a: any) =>
            onAddToQueue(dialogPatient, a, canAddToQueue ? "create" : "update")
          }
          facilityId={facilityId}
          canAddToTestQueue={canAddToQueue}
        />
      )}
      {shouldShowSuggestions && results}
    </>
  );
};

export default SearchResults;
