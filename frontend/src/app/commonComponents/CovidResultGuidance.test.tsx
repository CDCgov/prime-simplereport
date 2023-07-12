import { render } from "@testing-library/react";

import { TEST_RESULTS } from "../testResults/constants";

import CovidResultGuidance from "./CovidResultGuidance";
import "../../i18n";

describe("CovidResultGuidance", () => {
  const cases = [
    TEST_RESULTS.POSITIVE,
    TEST_RESULTS.NEGATIVE,
    TEST_RESULTS.UNDETERMINED,
    TEST_RESULTS.UNKNOWN,
  ];
  test.each(cases)("displays guidance for %p result", (testResult) => {
    const { container: containerReporting } = render(
      <CovidResultGuidance
        result={testResult}
        isPatientApp={false}
        needsHeading={true}
      />
    );

    expect(containerReporting).toMatchSnapshot();
    const { container: containerPXP } = render(
      <CovidResultGuidance
        result={testResult}
        isPatientApp={true}
        needsHeading={false}
      />
    );
    expect(containerPXP).toMatchSnapshot();
  });
});
