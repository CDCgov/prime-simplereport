import React from "react";

import RadioGroup from "../../commonComponents/RadioGroup";
import { COVID_RESULTS, TEST_RESULT_DESCRIPTIONS } from "../../constants";
import { DevicesMap, findResultByDiseaseName } from "../QueueItem";
import { TextWithTooltip } from "../../commonComponents/TextWithTooltip";
import Checkboxes from "../../commonComponents/Checkboxes";
import { MultiplexResultInput } from "../../../generated/graphql";
import { MULTIPLEX_DISEASES, TEST_RESULTS } from "../../testResults/constants";

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

const isDeviceFluOnly = (deviceId: string, devicesMap: DevicesMap) => {
  if (devicesMap.has(deviceId)) {
    return devicesMap
      .get(deviceId)!
      .supportedDiseaseTestPerformed.every(
        (disease) =>
          disease.supportedDisease.name === MULTIPLEX_DISEASES.FLU_A ||
          disease.supportedDisease.name === MULTIPLEX_DISEASES.FLU_B
      );
  }
  return false;
};

const doesDeviceSupportMultiplexAndCovidOnlyResult = (
  deviceId: string,
  devicesMap: DevicesMap
) => {
  if (devicesMap.has(deviceId)) {
    const deviceTypeCovidDiseases = devicesMap
      .get(deviceId)!
      .supportedDiseaseTestPerformed.filter(
        (disease) =>
          disease.supportedDisease.name === MULTIPLEX_DISEASES.COVID_19
      );

    if (deviceTypeCovidDiseases.length >= 1) {
      const testPerformedLoincs = [
        ...new Set(
          deviceTypeCovidDiseases.map((value) => value.testPerformedLoincCode)
        ),
      ].filter((item): item is string => !!item);
      const testOrderedLoincs = [
        ...new Set(
          deviceTypeCovidDiseases.map((value) => value.testOrderedLoincCode)
        ),
      ].filter((item): item is string => !!item);
      const hasSingleCovidTestPerformedLoinc = testPerformedLoincs.length === 1;
      const hasMultipleCovidTestOrderedLoincs = testOrderedLoincs.length > 1;
      return (
        hasSingleCovidTestPerformedLoinc && hasMultipleCovidTestOrderedLoincs
      );
    }
  }
  return false;
};

/**
 * COMPONENT
 */
interface Props {
  queueItemId: string;
  testResults: MultiplexResultInput[];
  deviceId: string;
  devicesMap: DevicesMap;
  onChange: (value: MultiplexResult[]) => void;
}

const MultiplexResultInputGroup: React.FC<Props> = ({
  queueItemId,
  testResults,
  deviceId,
  devicesMap,
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

  const deviceSupportsCovidOnlyResult =
    doesDeviceSupportMultiplexAndCovidOnlyResult(deviceId, devicesMap);
  const isFluOnly = isDeviceFluOnly(deviceId, devicesMap);

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

  return (
    <>
      <div className="grid-row grid-gap">
        {!isFluOnly && (
          <div
            className="grid-col-auto"
            data-testid={`covid-test-result-${queueItemId}`}
          >
            <RadioGroup
              legend="COVID-19 result"
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
            />
          </div>
        )}
        <div
          className="grid-col-auto"
          data-testid={`flu-a-test-result-${queueItemId}`}
        >
          <RadioGroup
            legend="Flu A result"
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
          />
        </div>
        <div
          className="grid-col-auto"
          data-testid={`flu-b-test-result-${queueItemId}`}
        >
          <RadioGroup
            legend="Flu B result"
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
      </div>
    </>
  );
};

export default MultiplexResultInputGroup;
