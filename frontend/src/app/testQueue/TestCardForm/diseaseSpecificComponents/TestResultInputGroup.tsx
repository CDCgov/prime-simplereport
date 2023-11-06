import { Alert } from "@trussworks/react-uswds";

import {
  MultiplexResultInput,
  SupportedDiseaseTestPerformed,
} from "../../../../generated/graphql";
import { DevicesMap } from "../../QueueItem";
import RadioGroup, {
  RadioGroupOptions,
} from "../../../commonComponents/RadioGroup";
import { TEST_RESULTS } from "../../../testResults/constants";
import { TEST_RESULT_DESCRIPTIONS } from "../../../constants";

interface Props {
  testOrderId: string;
  testResults: MultiplexResultInput[];
  deviceId: string;
  devicesMap: DevicesMap;
  onChange: (value: MultiplexResultInput[]) => void;
}

type TestResultRecord = Record<string, TEST_RESULTS>;

const convertTestResultRecordToArray = (testResultRecord: TestResultRecord) => {
  return Object.entries(testResultRecord).map(
    ([diseaseName, testResult]): MultiplexResultInput => {
      return {
        diseaseName: diseaseName,
        testResult: testResult,
      };
    }
  );
};

const convertMultiplexResultArrayToRecord = (
  testResults: MultiplexResultInput[]
) => {
  const testResultRecords: TestResultRecord = {};
  testResults.forEach((value) => {
    if (value.diseaseName) {
      testResultRecords[value.diseaseName] =
        (value.testResult as TEST_RESULTS) ?? TEST_RESULTS.UNKNOWN;
    }
  });
  return testResultRecords;
};

export const TestResultInputGroup = ({
  testOrderId,
  testResults,
  deviceId,
  devicesMap,
  onChange,
}: Props) => {
  const supportedDiseaseTests =
    devicesMap.get(deviceId)?.supportedDiseaseTestPerformed ?? [];

  if (supportedDiseaseTests.length === 0) {
    return (
      <Alert headingLevel={"h3"} type={"error"}>
        This device doesn't have any supported disease tests configured. Please
        ask your organization admin to add the correct test.
      </Alert>
    );
  }

  supportedDiseaseTests.sort((a, b) =>
    a.supportedDisease.name.localeCompare(b.supportedDisease.name)
  );

  const isSingleDiseaseTest = supportedDiseaseTests.length === 1;

  const testResultRecords = convertMultiplexResultArrayToRecord(testResults);

  const handleResultChange = (
    supportedTest: SupportedDiseaseTestPerformed,
    testResult: TEST_RESULTS
  ) => {
    testResultRecords[supportedTest.supportedDisease.name] = testResult;
    const results = convertTestResultRecordToArray(testResultRecords);
    onChange(results);
  };

  return (
    <div className="grid-row grid-gap">
      {supportedDiseaseTests.map((supportedTest) => {
        const buttons: RadioGroupOptions<string> = [
          {
            value: TEST_RESULTS.POSITIVE,
            label: `${TEST_RESULT_DESCRIPTIONS.POSITIVE} (+)`,
          },
          {
            value: TEST_RESULTS.NEGATIVE,
            label: `${TEST_RESULT_DESCRIPTIONS.NEGATIVE} (-)`,
          },
          {
            value: TEST_RESULTS.UNDETERMINED,
            label: `${TEST_RESULT_DESCRIPTIONS.UNDETERMINED}`,
          },
        ];

        return (
          <div
            className="grid-col-auto"
            key={`${supportedTest.supportedDisease.internalId}`}
          >
            <RadioGroup
              legend={`${supportedTest.supportedDisease.name} result`}
              buttons={buttons}
              name={`${supportedTest.supportedDisease.name}-test-result-${testOrderId}`}
              selectedRadio={
                testResultRecords[supportedTest.supportedDisease.name]
              }
              wrapperClassName="prime-radio__group"
              required={isSingleDiseaseTest}
              onChange={(testResult) =>
                handleResultChange(supportedTest, testResult as TEST_RESULTS)
              }
            ></RadioGroup>
          </div>
        );
      })}
    </div>
  );
};
