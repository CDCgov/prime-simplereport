import React, { useState } from "react";
import PropTypes from "prop-types";

import RadioGroup from "../commonComponents//RadioGroup";
import Button from "../commonComponents//Button";
import { testResultPropType } from "../propTypes";
import { COVID_RESULTS } from "../constants";

const TestResultInputForm = ({ testResult, onSubmit }) => {
  const [testResultValue, updateTestResultValue] = useState(
    testResult.testResult || null
  );

  const onClearClick = () => {
    updateTestResultValue(null);
  };

  const onTestResultChange = (e) => {
    updateTestResultValue(e.target.value);
  };

  const testResultDetails = (testResult) => {
    return testResult ? (
      <React.Fragment>
        <RadioGroup
          onChange={onTestResultChange}
          buttons={[
            { value: COVID_RESULTS.POSITIVE, label: "Positive" },
            {
              value: COVID_RESULTS.NEGATIVE,
              label: "Negative",
            },
            {
              value: COVID_RESULTS.INCONCLUSIVE,
              label: "Inconclusive",
            },
          ]}
          name="covid-test-result" // TODO: make unique if there are multiple test results on this page
          selectedRadio={testResultValue}
        />
        <Button onClick={onSubmit} type="submit" outline label="Submit" />
        <a href="#clear" className="" onClick={onClearClick}>
          Clear
        </a>
      </React.Fragment>
    ) : null;
  };

  return (
    <form className="usa-form">
      <h4> SARS-CoV-2 Results </h4>
      {testResultDetails(testResult)}
    </form>
  );
};

TestResultInputForm.propTypes = {
  testResult: testResultPropType,
  onSubmit: PropTypes.func,
};
export default TestResultInputForm;
