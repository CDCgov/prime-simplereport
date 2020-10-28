import React from "react";
import PropTypes from "prop-types";

import RadioGroup from "../commonComponents//RadioGroup";
import Button from "../commonComponents//Button";
import Anchor from "../commonComponents/Anchor";
import { COVID_RESULTS } from "../constants";
import { v4 as uuidv4 } from "uuid";

const TestResultInputForm = ({ testResultValue, onSubmit, onChange }) => {
  const onClearClick = (e) => {
    e.preventDefault();
    onChange(null);
  };

  const testResultForm = (
    <React.Fragment>
      <RadioGroup
        onChange={(e) => onChange(e.target.value)}
        buttons={[
          {
            value: COVID_RESULTS.POSITIVE,
            label: "Positive (+)",
            failure: true,
          },
          {
            value: COVID_RESULTS.NEGATIVE,
            label: "Negative (-)",
            success: true,
          },
          {
            value: COVID_RESULTS.INCONCLUSIVE,
            label: "Inconclusive",
          },
        ]}
        name={`covid-test-result-${uuidv4()}`}
        selectedRadio={testResultValue}
      />
      <div className="prime-test-result-submit">
        <Button onClick={onSubmit} type="submit" outline label="Submit" />
        <Anchor onClick={onClearClick} text="Clear" />
      </div>
    </React.Fragment>
  );

  return (
    <form className="usa-form">
      <h4 className="prime-radio__title"> SARS-CoV-2 Results </h4>
      {testResultForm}
    </form>
  );
};

TestResultInputForm.propTypes = {
  testResultValue: PropTypes.oneOf([...Object.values(COVID_RESULTS), null]),
  onSubmit: PropTypes.func,
  onChange: PropTypes.func,
};
export default TestResultInputForm;
