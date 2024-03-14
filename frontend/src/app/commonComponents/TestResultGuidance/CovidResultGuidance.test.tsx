import { render } from "@testing-library/react";
import { cloneDeep } from "lodash";

import { TEST_RESULTS } from "../../testResults/constants";

import CovidResultGuidance from "./CovidResultGuidance";

import "../../../i18n";

describe("CovidResultGuidance", () => {
  const mockResultTemplate = {
    disease: {
      name: "COVID-19",
    },
    testResult: TEST_RESULTS.POSITIVE,
  } as MultiplexResult;

  const cases = [
    TEST_RESULTS.POSITIVE,
    TEST_RESULTS.NEGATIVE,
    TEST_RESULTS.UNDETERMINED,
    TEST_RESULTS.UNKNOWN,
  ];

  test.each(cases)("displays guidance for %p result", (testResult) => {
    const mockResult = cloneDeep(mockResultTemplate);
    mockResult.testResult = testResult;
    const { container: containerReporting } = render(
      <CovidResultGuidance result={mockResult} isPatientApp={false} />
    );

    expect(containerReporting).toMatchSnapshot();
    const { container: containerPXP } = render(
      <CovidResultGuidance result={mockResult} isPatientApp={true} />
    );
    expect(containerPXP).toMatchSnapshot();
  });
});
