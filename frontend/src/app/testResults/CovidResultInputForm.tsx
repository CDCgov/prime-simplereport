import React from "react";

import RadioGroup from "../commonComponents/RadioGroup";
import Button from "../commonComponents/Button/Button";
import { COVID_RESULTS, TEST_RESULT_DESCRIPTIONS } from "../constants";
import { findResultByDiseaseName } from "../testQueue/QueueItem";
import { MultiplexResultInput } from "../../generated/graphql";

import { MULTIPLEX_DISEASES, TEST_RESULTS } from "./constants";

interface CovidResult {
  diseaseName: MULTIPLEX_DISEASES.COVID_19;
  testResult: TestResult;
}

const convertFromMultiplexResultInputs = (
  multiplexResultInputs: MultiplexResultInput[]
): TestResult => {
  const covidResult: TestResult =
    (findResultByDiseaseName(
      multiplexResultInputs ?? [],
      MULTIPLEX_DISEASES.COVID_19
    ) as TestResult) ?? TEST_RESULTS.UNKNOWN;
  return covidResult;
};

const convertFromCovidResult = (covidResult: TestResult): CovidResult[] => {
  const covidResults: CovidResult[] = [
    {
      diseaseName: MULTIPLEX_DISEASES.COVID_19,
      testResult: covidResult,
    },
  ];

  return covidResults.filter(
    (result) => result.testResult !== TEST_RESULTS.UNKNOWN
  );
};

interface Props {
  queueItemId: string;
  testResults: MultiplexResultInput[];
  isSubmitDisabled?: boolean;
  onChange: (value: CovidResult[]) => void;
  onSubmit: () => void;
}

const CovidResultInputForm: React.FC<Props> = ({
  queueItemId,
  testResults,
  isSubmitDisabled,
  onSubmit,
  onChange,
}) => {
  const resultCovidFormat = convertFromMultiplexResultInputs(testResults);
  const allowSubmit =
    resultCovidFormat &&
    resultCovidFormat !== TEST_RESULTS.UNKNOWN &&
    !isSubmitDisabled;

  const onResultSubmit = (event: React.FormEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onSubmit();
  };
  const convertAndSendResults = (covidResult: TestResult) => {
    const results = convertFromCovidResult(covidResult);
    onChange(results);
  };

  return (
    <form className="usa-form maxw-none">
      <h4 className="prime-radio__title">COVID-19 results</h4>
      <RadioGroup
        legend="Test result"
        legendSrOnly
        onChange={(value) => {
          convertAndSendResults(value as TestResult);
        }}
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
        selectedRadio={resultCovidFormat}
        wrapperClassName="prime-radio__group"
        disabled={isSubmitDisabled}
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
    </form>
  );
};

export default CovidResultInputForm;
