import React from "react";

import RadioGroup from "../commonComponents/RadioGroup";
import Button from "../commonComponents/Button/Button";
import { COVID_RESULTS, TEST_RESULT_DESCRIPTIONS } from "../constants";
import { findResultByDiseaseName } from "../testQueue/QueueItem";
import { TextWithTooltip } from "../commonComponents/TextWithTooltip";
import Checkboxes from "../commonComponents/Checkboxes";
import { MultiplexResultInput } from "../../generated/graphql";

const MULTIPLEX_DISEASE_TYPE = {
  COVID: "COVID-19" as MultiplexDisease,
  FLU_A: "Flu A" as MultiplexDisease,
  FLU_B: "Flu B" as MultiplexDisease,
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
        "COVID-19"
      ) as TestResult) ?? "UNKNOWN",
    fluA:
      (findResultByDiseaseName(diseaseResults ?? [], "Flu A") as TestResult) ??
      "UNKNOWN",
    fluB:
      (findResultByDiseaseName(diseaseResults ?? [], "Flu B") as TestResult) ??
      "UNKNOWN",
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

  return diseaseResults.filter((result) => result.testResult !== "UNKNOWN");
};

/**
 * COMPONENT
 */
interface Props {
  queueItemId: string;
  testResults: MultiplexResultInput[];
  isSubmitDisabled?: boolean;
  onChange: (value: MultiplexResult[]) => void;
  onSubmit: () => void;
}

const MultiplexResultInputForm: React.FC<Props> = ({
  queueItemId,
  testResults,
  isSubmitDisabled,
  onSubmit,
  onChange,
}) => {
  //eslint-disable-next-line no-restricted-globals
  const isMobile = screen.width <= 600;
  const resultsMultiplexFormat: MultiplexResultState = convertFromMultiplexResultInputs(
    testResults
  );
  const inconclusiveCheck =
    resultsMultiplexFormat.covid === "UNDETERMINED" &&
    resultsMultiplexFormat.fluA === "UNDETERMINED" &&
    resultsMultiplexFormat.fluB === "UNDETERMINED";

  /**
   * Handle Setting Results
   */
  const setMultiplexResultInput = (
    diseaseName: "covid" | "fluA" | "fluB",
    value: TestResult
  ) => {
    const newResults: MultiplexResultState = { ...resultsMultiplexFormat };
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
        covid: "UNDETERMINED",
        fluA: "UNDETERMINED",
        fluB: "UNDETERMINED",
      };
      convertAndSendResults(inconclusiveState);
    } else {
      const currentState = { ...resultsMultiplexFormat };
      if (currentState.covid === "UNDETERMINED") {
        currentState.covid = "UNKNOWN";
      }
      if (currentState.fluA === "UNDETERMINED") {
        currentState.fluA = "UNKNOWN";
      }
      if (currentState.fluB === "UNDETERMINED") {
        currentState.fluB = "UNKNOWN";
      }
      convertAndSendResults(currentState);
    }
  };

  /**
   * Form Validation
   * */
  const validateForm = () => {
    if (
      inconclusiveCheck ||
      ((resultsMultiplexFormat.covid === "POSITIVE" ||
        resultsMultiplexFormat.covid === "NEGATIVE") &&
        (resultsMultiplexFormat.fluA === "POSITIVE" ||
          resultsMultiplexFormat.fluA === "NEGATIVE") &&
        (resultsMultiplexFormat.fluB === "POSITIVE" ||
          resultsMultiplexFormat.fluB === "NEGATIVE"))
    ) {
      return true;
    }

    return false;
  };

  const onResultSubmit = (event: React.FormEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form className="usa-form maxw-none multiplex-result-form">
      <div className="grid-row grid-gap-2">
        <div className="grid-col-4">
          <h4 className="prime-radio__title">COVID-19</h4>
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
        <div className="grid-col-4">
          <h4 className="prime-radio__title">Flu A</h4>
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
        <div className="grid-col-4">
          <h4 className="prime-radio__title">Flu B</h4>
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
            tooltip="COVID-19 results are reported to your public health department. Flu results are not reported at this time."
            position={isMobile ? "top" : "left"}
          />
        </div>
        <Button
          className="grid-col-auto prime-multiplex-btn"
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
