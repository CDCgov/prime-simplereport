import React, { useState } from "react";
import Button from "../../commonComponents/Button";
import AoeModalForm from "../AoEForm/AoEModalForm";
import { displayFullName } from "../../utils";

interface SearchResultsProps {
  patients: any[]; //TODO TYPE: Patient
  onAddToQueue: (a: any, b: any) => null; //TODO TYPE: Patient, answers
  facilityId: string;
  patientsInQueue: string[];
}

const SearchResults = ({
  patients,
  onAddToQueue,
  facilityId,
  patientsInQueue,
}: SearchResultsProps) => {
  const [dialogPatient, setDialogPatient] = useState(null);
  const [canAddToQueue, setCanAddToQueue] = useState(false);

  const canAddToTestQueue = (patientId = "") => {
    return patientsInQueue.indexOf(patientId) === -1;
  };
  if (patients.length === 0) {
    return <h3> No results </h3>;
  }
  return (
    <div className="usa-card__container shadow-3 results-dropdown">
      <div className="usa-card__body">
        {dialogPatient !== null && (
          <AoeModalForm
            saveButtonText="Continue"
            patient={dialogPatient}
            onClose={() => setDialogPatient(null)}
            saveCallback={(a: any) => onAddToQueue(dialogPatient, a)}
            facilityId={facilityId}
            canAddToTestQueue={canAddToQueue}
          />
        )}
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
};

export default SearchResults;
