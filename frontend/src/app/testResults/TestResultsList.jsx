import React from "react";
import moment from "moment";
import { useSelector } from "react-redux";
import { PATIENT_TERM_CAP } from "../../config/constants";

import { getTestResultsWithPatientDetails } from "./testResultsSelector";

const TestResultsList = () => {
  const testResults = useSelector(getTestResultsWithPatientDetails);

  const testResultRows = (results) => {
    if (results.length === 0) {
      return;
    }

    return results.map((result) => (
      <tr key={result.patientId}>
        <th scope="row">{result.displayName}</th>
        <td>{result.patientId}</td>
        <td>{moment(result.dateTested).format("MMM DD YYYY")}</td>
        <td>{result.result}</td>
      </tr>
    ));
  };

  let rows = testResultRows(testResults);
  return (
    <React.Fragment>
      <main className="prime-home">
        <div className="grid-container">
          <div className="grid-row">
            <div className="prime-container usa-card__container">
              <div className="usa-card__header">
                <h2> Test Results </h2>
              </div>
              <div className="usa-card__body">
                <table className="usa-table usa-table--borderless width-full">
                  <thead>
                    <tr>
                      <th scope="col">{PATIENT_TERM_CAP} Name</th>
                      <th scope="col">Unique ID</th>
                      <th scope="col">Date of Test</th>
                      <th scope="col">Result</th>
                    </tr>
                  </thead>
                  <tbody>{rows}</tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </React.Fragment>
  );
};

export default TestResultsList;
