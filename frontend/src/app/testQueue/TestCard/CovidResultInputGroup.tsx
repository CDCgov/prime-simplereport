import React from "react";

import { MULTIPLEX_DISEASES, TEST_RESULTS } from "../../testResults/constants";
import { findResultByDiseaseName } from "../QueueItem";
import { MultiplexResultInput } from "../../../generated/graphql";
import RadioGroup from "../../commonComponents/RadioGroup";
import { COVID_RESULTS, TEST_RESULT_DESCRIPTIONS } from "../../constants";

interface CovidResult extends MultiplexResultInput {
  diseaseName: MULTIPLEX_DISEASES.COVID_19;
  testResult: TestResult;
}

const convertFromMultiplexResultInputs = (
  multiplexResultInputs: MultiplexResultInput[]
): TestResult => {
  return (
    (findResultByDiseaseName(
      multiplexResultInputs ?? [],
      MULTIPLEX_DISEASES.COVID_19
    ) as TestResult) ?? TEST_RESULTS.UNKNOWN
  );
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
}

const CovidResultInputGroup: React.FC<Props> = ({
  queueItemId,
  testResults,
  isSubmitDisabled,
  onChange,
}) => {
  const resultCovidFormat = convertFromMultiplexResultInputs(testResults);

  const convertAndSendResults = (covidResult: TestResult) => {
    const results = convertFromCovidResult(covidResult);
    onChange(results);
  };

  return (
    <form className="usa-form maxw-none">
      <h3 className="prime-radio__title">COVID-19 results</h3>
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
    </form>
  );
};

export default CovidResultInputGroup;
