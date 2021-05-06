import React from "react";

import RadioGroup from "../commonComponents/RadioGroup";
import Button from "../commonComponents/Button/Button";
import { COVID_RESULTS, TEST_RESULT_DESCRIPTIONS } from "../constants";
import { TestResult } from "../testQueue/QueueItem";

interface Props {
  queueItemId: string;
  testResultValue: TestResult | undefined;
  isSubmitDisabled?: boolean;
  onChange: (value: TestResult | undefined) => void;
  onSubmit: () => void;
}

const TestResultInputForm: React.FC<Props> = ({
  queueItemId,
  testResultValue,
  isSubmitDisabled,
  onSubmit,
  onChange,
}) => {
  const onResultClick = (value: TestResult) => {
    if (value === testResultValue) {
      onChange(undefined);
    }
  };

  const allowSubmit = testResultValue && !isSubmitDisabled;

  const onResultSubmit = (event: React.FormEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (allowSubmit) {
      onSubmit();
    }
  };

  return (
    <form className="usa-form">
      <h4 className="prime-radio__title">SARS-CoV-2 results</h4>
      <React.Fragment>
        <RadioGroup
          legend="Test result"
          legendSrOnly
          onClick={onResultClick}
          onChange={onChange}
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
          name={`covid-test-result-${queueItemId}`}
          selectedRadio={testResultValue}
        />
        <div className="prime-test-result-submit">
          <Button
            onClick={onResultSubmit}
            type="submit"
            disabled={!allowSubmit}
            variant="outline"
            label="Submit"
          />
        </div>
      </React.Fragment>
    </form>
  );
};

export default TestResultInputForm;
