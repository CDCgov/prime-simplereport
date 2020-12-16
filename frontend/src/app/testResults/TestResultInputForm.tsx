import React from "react";

import RadioGroup from "../commonComponents/RadioGroup";
import Button from "../commonComponents/Button";
import { COVID_RESULTS, TEST_RESULT_DESCRIPTIONS } from "../constants";
import { v4 as uuidv4 } from "uuid";

interface Props {
  testResultValue: TestResult | undefined;
  onChange: (value: TestResult | undefined) => void;
  onSubmit: () => void;
}

const TestResultInputForm: React.FC<Props> = ({
  testResultValue,
  onSubmit,
  onChange,
}) => {
  const onResultChange = (event: React.FormEvent<HTMLInputElement>) => {
    const value = (event.target as HTMLInputElement).value as TestResult;
    onChange(value === testResultValue ? undefined : value);
  };

  const onResultSubmit = (event: React.FormEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form className="usa-form">
      <h4 className="prime-radio__title"> SARS-CoV-2 Results </h4>
      <React.Fragment>
        <RadioGroup
          onChange={onResultChange}
          buttons={[
            {
              value: COVID_RESULTS.POSITIVE,
              label: `${TEST_RESULT_DESCRIPTIONS.POSITIVE} (+)`,
            },
            {
              value: COVID_RESULTS.NEGATIVE,
              label: `${TEST_RESULT_DESCRIPTIONS.NEGATIVE} (-)`,
            },
            {
              value: COVID_RESULTS.INCONCLUSIVE,
              label: `${TEST_RESULT_DESCRIPTIONS.UNDETERMINED}`,
            },
          ]}
          name={`covid-test-result-${uuidv4()}`}
          selectedRadio={testResultValue}
        />
        <div className="prime-test-result-submit">
          <Button
            onClick={onResultSubmit}
            type="submit"
            disabled={!testResultValue}
            outline
            label="Submit"
          />
        </div>
      </React.Fragment>
    </form>
  );
};

export default TestResultInputForm;
