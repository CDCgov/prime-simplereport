import React from "react";
import classNames from "classnames";

import RadioGroup from "../commonComponents/RadioGroup";
import Button from "../commonComponents/Button/Button";
import { COVID_RESULTS, TEST_RESULT_DESCRIPTIONS } from "../constants";
import { findResultByDiseaseName } from "../testQueue/QueueItem";
import { TextWithTooltip } from "../commonComponents/TextWithTooltip";
import Checkboxes from "../commonComponents/Checkboxes";
import { MultiplexResultInput } from "../../generated/graphql";

import { MULTIPLEX_DISEASES, TEST_RESULTS } from "./constants";

const MULTIPLEX_DISEASE_TYPE = {
  COVID: MULTIPLEX_DISEASES.COVID_19 as MultiplexDisease,
  FLU_A: MULTIPLEX_DISEASES.FLU_A as MultiplexDisease,
  FLU_B: MULTIPLEX_DISEASES.FLU_B as MultiplexDisease,
  ALL: "All",
};

interface MultiplexResult {
  diseaseName: MultiplexDisease;
  testResult: TestResult;
}

interface MultiplexResultState {
  covid: TestResult;
  fluA: TestResult;
  fluB: TestResult;
}

const convertFromMultiplexResultInputs = (
  diseaseResults: MultiplexResultInput[]
): MultiplexResultState => {
  const multiplexResult: MultiplexResultState = {
    covid:
      (findResultByDiseaseName(
        diseaseResults ?? [],
        MULTIPLEX_DISEASES.COVID_19
      ) as TestResult) ?? TEST_RESULTS.UNKNOWN,
    fluA:
      (findResultByDiseaseName(
        diseaseResults ?? [],
        MULTIPLEX_DISEASES.FLU_A
      ) as TestResult) ?? TEST_RESULTS.UNKNOWN,
    fluB:
      (findResultByDiseaseName(
        diseaseResults ?? [],
        MULTIPLEX_DISEASES.FLU_B
      ) as TestResult) ?? TEST_RESULTS.UNKNOWN,
  };

  return multiplexResult;
};

const convertFromMultiplexResult = (
  multiplexResult: MultiplexResultState
): MultiplexResult[] => {
  const diseaseResults: MultiplexResult[] = [
    {
      diseaseName: MULTIPLEX_DISEASE_TYPE.COVID,
      testResult: multiplexResult.covid,
    },
    {
      diseaseName: MULTIPLEX_DISEASE_TYPE.FLU_A,
      testResult: multiplexResult.fluA,
    },
    {
      diseaseName: MULTIPLEX_DISEASE_TYPE.FLU_B,
      testResult: multiplexResult.fluB,
    },
  ];

  return diseaseResults.filter(
    (result) => result.testResult !== TEST_RESULTS.UNKNOWN
  );
};

/**
 * COMPONENT
 */
interface Props {
  queueItemId: string;
  testResults: MultiplexResultInput[];
  isSubmitDisabled?: boolean;
  deviceSupportsCovidOnlyResult?: boolean;
  isFluOnly?: boolean;
  onChange: (value: MultiplexResult[]) => void;
  onSubmit: () => void;
}

const MultiplexResultInputForm: React.FC<Props> = ({
  queueItemId,
  testResults,
  isSubmitDisabled,
  deviceSupportsCovidOnlyResult,
  isFluOnly,
  onSubmit,
  onChange,
}) => {
  //eslint-disable-next-line no-restricted-globals
  const isMobile = screen.width <= 600;
  const resultsMultiplexFormat: MultiplexResultState =
    convertFromMultiplexResultInputs(testResults);
  let inconclusiveCheck =
    resultsMultiplexFormat.covid === TEST_RESULTS.UNDETERMINED &&
    resultsMultiplexFormat.fluA === TEST_RESULTS.UNDETERMINED &&
    resultsMultiplexFormat.fluB === TEST_RESULTS.UNDETERMINED;

  if (isFluOnly) {
    inconclusiveCheck =
      resultsMultiplexFormat.fluB === TEST_RESULTS.UNDETERMINED &&
      resultsMultiplexFormat.fluA === TEST_RESULTS.UNDETERMINED;
  }

  /**
   * Handle Setting Results
   */
  const setMultiplexResultInput = (
    diseaseName: "covid" | "fluA" | "fluB",
    value: TestResult
  ) => {
    let newResults: MultiplexResultState = resultsMultiplexFormat;
    if (inconclusiveCheck) {
      newResults = {
        covid: TEST_RESULTS.UNKNOWN,
        fluA: TEST_RESULTS.UNKNOWN,
        fluB: TEST_RESULTS.UNKNOWN,
      };
    }
    newResults[diseaseName] = value;
    convertAndSendResults(newResults);
  };

  const convertAndSendResults = (multiplexResults: MultiplexResultState) => {
    const results = convertFromMultiplexResult(multiplexResults);
    onChange(results);
  };

  /**
   * Handle Inconclusive
   */

  const handleInconclusiveSelection = (value: any) => {
    const markedInconclusive = value.target.checked;
    if (markedInconclusive) {
      const inconclusiveState: MultiplexResultState = {
        covid: isFluOnly ? TEST_RESULTS.UNKNOWN : TEST_RESULTS.UNDETERMINED,
        fluA: TEST_RESULTS.UNDETERMINED,
        fluB: TEST_RESULTS.UNDETERMINED,
      };
      convertAndSendResults(inconclusiveState);
    } else {
      const currentState = { ...resultsMultiplexFormat };
      if (currentState.covid === TEST_RESULTS.UNDETERMINED) {
        currentState.covid = TEST_RESULTS.UNKNOWN;
      }
      if (currentState.fluA === TEST_RESULTS.UNDETERMINED) {
        currentState.fluA = TEST_RESULTS.UNKNOWN;
      }
      if (currentState.fluB === TEST_RESULTS.UNDETERMINED) {
        currentState.fluB = TEST_RESULTS.UNKNOWN;
      }
      convertAndSendResults(currentState);
    }
  };

  /**
   * Form Validation
   * */
  const validateForm = () => {
    let anyResultIsInconclusive =
      resultsMultiplexFormat.covid === TEST_RESULTS.UNDETERMINED ||
      resultsMultiplexFormat.fluA === TEST_RESULTS.UNDETERMINED ||
      resultsMultiplexFormat.fluB === TEST_RESULTS.UNDETERMINED;

    let allResultsAreEqual =
      resultsMultiplexFormat.covid === resultsMultiplexFormat.fluA &&
      resultsMultiplexFormat.fluA === resultsMultiplexFormat.fluB;

    if (isFluOnly) {
      allResultsAreEqual =
        resultsMultiplexFormat.fluA === resultsMultiplexFormat.fluB;
      anyResultIsInconclusive =
        resultsMultiplexFormat.fluA === TEST_RESULTS.UNDETERMINED ||
        resultsMultiplexFormat.fluB === TEST_RESULTS.UNDETERMINED;
    }

    const covidIsFilled =
      resultsMultiplexFormat.covid === TEST_RESULTS.POSITIVE ||
      resultsMultiplexFormat.covid === TEST_RESULTS.NEGATIVE;

    const fluAIsFilled =
      resultsMultiplexFormat.fluA === TEST_RESULTS.POSITIVE ||
      resultsMultiplexFormat.fluA === TEST_RESULTS.NEGATIVE;

    const fluBIsFilled =
      resultsMultiplexFormat.fluB === TEST_RESULTS.POSITIVE ||
      resultsMultiplexFormat.fluB === TEST_RESULTS.NEGATIVE;

    if (anyResultIsInconclusive && !allResultsAreEqual) {
      return false;
    }
    return (
      inconclusiveCheck ||
      (deviceSupportsCovidOnlyResult &&
        covidIsFilled &&
        !fluAIsFilled &&
        !fluBIsFilled) ||
      (isFluOnly && fluAIsFilled && fluBIsFilled) ||
      (covidIsFilled && fluAIsFilled && fluBIsFilled)
    );
  };

  const onResultSubmit = (event: React.FormEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form className="usa-form maxw-none multiplex-result-form">
      <div className="grid-row grid-gap-2">
        {!isFluOnly && (
          <div
            className="grid-col-4"
            data-testid={`covid-test-result-${queueItemId}`}
          >
            <h2 className="prime-radio__title">COVID-19</h2>
            <RadioGroup
              legend="COVID-19 result"
              legendSrOnly
              onChange={(value) => {
                setMultiplexResultInput("covid", value);
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
              ]}
              name={`covid-test-result-${queueItemId}`}
              selectedRadio={resultsMultiplexFormat.covid}
              wrapperClassName="prime-radio__group"
              disabled={isSubmitDisabled}
            />
          </div>
        )}
        <div
          className="grid-col-4"
          data-testid={`flu-a-test-result-${queueItemId}`}
        >
          <h2 className="prime-radio__title">Flu A</h2>
          <RadioGroup
            legend="Flu A result"
            legendSrOnly
            onChange={(value) => {
              setMultiplexResultInput("fluA", value);
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
            ]}
            name={`flu-a-test-result-${queueItemId}`}
            selectedRadio={resultsMultiplexFormat.fluA}
            wrapperClassName="prime-radio__group"
            disabled={isSubmitDisabled}
          />
        </div>
        <div
          className="grid-col-4"
          data-testid={`flu-b-test-result-${queueItemId}`}
        >
          <h2 className="prime-radio__title">Flu B</h2>
          <RadioGroup
            legend="Flu B result"
            legendSrOnly
            onChange={(value) => {
              setMultiplexResultInput("fluB", value);
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
            ]}
            name={`flu-b-test-result-${queueItemId}`}
            selectedRadio={resultsMultiplexFormat.fluB}
            wrapperClassName="prime-radio__group"
            disabled={isSubmitDisabled}
          />
        </div>
      </div>
      <div className="prime-test-result-submit grid-row">
        <div className="grid-col-fill">
          <Checkboxes
            onChange={handleInconclusiveSelection}
            legend="Inconclusive tests"
            legendSrOnly
            name="inconclusive-tests"
            disabled={isSubmitDisabled}
            boxes={[
              {
                value: "inconclusive",
                label: "Mark test as inconclusive",
                checked: inconclusiveCheck,
              },
            ]}
          />
        </div>
        <div className="grid-col-auto">
          <TextWithTooltip
            text="Results info"
            hideText={true}
            tooltip={
              isFluOnly
                ? "Flu results are only reported to California at this time."
                : "COVID-19 results are reported to your public health department. Flu results are only reported to California at this time."
            }
            position={isMobile ? "top" : "left"}
          />
        </div>
        <Button
          className={classNames("grid-col-auto", "prime-multiplex-btn", {
            "no-hover-state-when-disabled": !validateForm() || isSubmitDisabled,
          })}
          onClick={onResultSubmit}
          type="submit"
          disabled={!validateForm() || isSubmitDisabled}
          variant="outline"
          label="Submit"
        />
      </div>
    </form>
  );
};

export default MultiplexResultInputForm;
