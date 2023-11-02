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
  return Object.entries(testResultRecord).map((entry): MultiplexResultInput => {
    return {
      diseaseName: entry[0],
      testResult: entry[1],
    };
  });
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
    // still show covid only as a default?
    // or show an error message?
    return <></>;
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
