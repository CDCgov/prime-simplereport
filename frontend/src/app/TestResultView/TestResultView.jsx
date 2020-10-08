import React from "react";
import { Link } from "react-router-dom";
import { testResultPropType } from "../propTypes";
import { COVID_RESULTS } from "../constants";
import RadioGroup from "../common/components/RadioGroup";
import Button from "../common/components/Button";
import { useLocation } from "react-router-dom";

const TestResultView = ({ testResult, patient }) => {
  console.log("TRV testResult", testResult);
  console.log("TRV patient", patient);
  const location = useLocation();
  const patientSummary = (testResult) => {
    if (!testResult) {
      return null;
    }
    return (
      <React.Fragment>
        <h4> Name </h4>
        <p> {testResult.name} </p>
        <h4> Date of Birth</h4>
        <p> {testResult.birthDate} </p>
        <h4> Phone Number</h4>
        <p> {testResult.phone} </p>
        <h4> Address</h4>
        <p> {testResult.address} </p>
        <Link to={`${location.pathname}/update`}>
          <Button
            onClick={() => {}}
            type="button"
            label="Edit Patient Data"
            outline={true}
          />
        </Link>
      </React.Fragment>
    );
  };

  const testResultDetails = (testResult) => {
    return testResult ? (
      <React.Fragment>
        <RadioGroup
          onChange={() => {}}
          buttons={[
            { value: COVID_RESULTS.DETECTED, label: "Detected" },
            {
              value: COVID_RESULTS.NOT_DETECTED,
              label: "NOT Detected",
            },
            {
              value: COVID_RESULTS.INCONCLUSIVE,
              label: "Inconclusive",
            },
          ]}
          name="covid-test-result" // TODO: make unique if there are multiple test results on this page
          selectedRadio={testResult.testResult}
        />
        <Button onClick={() => {}} type="submit" label="Submit Results" />
      </React.Fragment>
    ) : null;
  };

  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="grid-row grid-gap">
          <div className="tablet:grid-col">
            <div className="prime-container">
              <h2> Patient Summary </h2>
              {patientSummary(testResult)}
            </div>
          </div>
          <div className="tablet:grid-col">
            <div className="prime-container">
              <form className="usa-form">
                <h2> SARS-CoV-2 Results </h2>
                {testResultDetails(testResult)}
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

TestResultView.propTypes = {
  testResults: testResultPropType,
};
export default TestResultView;
