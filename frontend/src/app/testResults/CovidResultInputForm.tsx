import React from "react";

import RadioGroup from "../commonComponents/RadioGroup";
import Button from "../commonComponents/Button/Button";
import { COVID_RESULTS, TEST_RESULT_DESCRIPTIONS } from "../constants";
import { findResultByDiseaseName, TestResult } from "../testQueue/QueueItem";
import { DiseaseResult } from "../../generated/graphql";

interface CovidResult {
  diseaseName: "COVID-19";
  testResult: TestResult;
}

const convertFromDiseaseResults = (
  diseaseResults: DiseaseResult[]
): TestResult => {
  const covidResult: TestResult =
    (findResultByDiseaseName(diseaseResults ?? [], "COVID-19") as TestResult) ??
    "UNKNOWN";
  return covidResult;
};

const convertFromCovidResult = (covidResult: TestResult): CovidResult[] => {
  const diseaseResults: CovidResult[] = [
    {
      diseaseName: "COVID-19",
      testResult: covidResult,
    },
  ];

  return diseaseResults.filter((result) => result.testResult !== "UNKNOWN");
};

interface Props {
  queueItemId: string;
  testResults: DiseaseResult[];
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
  const resultCovidFormat = convertFromDiseaseResults(testResults);
  const allowSubmit =
    resultCovidFormat && resultCovidFormat !== "UNKNOWN" && !isSubmitDisabled;

  const onResultSubmit = (event: React.FormEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (allowSubmit) {
      onSubmit();
    }
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
