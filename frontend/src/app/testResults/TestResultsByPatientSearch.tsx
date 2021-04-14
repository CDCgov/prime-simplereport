import Button from "../commonComponents/Button";
import { Patient } from "../patients/ManagePatients";
import { displayFullName } from "../utils";

interface TestResultsByPatientSearchProps {
  patients: any[]; //TODO TYPE: Patient
  onPatientSelect: (a: Patient) => void;
  shouldShowSuggestions: boolean;
  loading: boolean;
}

const TestResultsByPatientSearch = ({
  patients,
  onPatientSelect,
  shouldShowSuggestions,
  loading,
}: TestResultsByPatientSearchProps) => {
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
                      <Button
                        variant="unstyled"
                        label="Get test results"
                        onClick={() => {
                          onPatientSelect(p);
                        }}
                      />
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

  return <>{shouldShowSuggestions && results}</>;
};

export default TestResultsByPatientSearch;
