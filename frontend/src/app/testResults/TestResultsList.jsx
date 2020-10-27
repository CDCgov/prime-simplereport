import React from "react";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import { useSelector } from "react-redux";

import { getTestResultsWithPatientDetails } from "./testResultsSelector";

const TestResultsList = () => {
  const testResults = useSelector(getTestResultsWithPatientDetails);

  const testResultRows = (results) => {
    if (results.length === 0) {
      return;
    }

    return results.map((result) => (
      <tr key={`patient-${uuidv4()}`}>
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
            <h2> All Tests </h2>
            <div className="prime-container">
              <table className="usa-table usa-table--borderless">
                <thead>
                  <tr>
                    <th scope="col">Patient Name</th>
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
      </main>
    </React.Fragment>
  );
};

export default TestResultsList;
