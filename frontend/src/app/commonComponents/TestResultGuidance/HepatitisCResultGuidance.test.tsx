import { render, screen } from "@testing-library/react";
import { cloneDeep } from "lodash";

import "../../../i18n";

import { MULTIPLEX_DISEASES, TEST_RESULTS } from "../../testResults/constants";

import HepatitisCResultGuidance from "./HepatitisCResultGuidance";

describe("HepatitisCResultGuidance", () => {
  const mockResultTemplate = {
    disease: {
      name: MULTIPLEX_DISEASES.HEPATITIS_C,
    },
    testResult: TEST_RESULTS.POSITIVE,
  } as MultiplexResult;

  it("displays guidance for a positive Hepatitis-C result", () => {
    const { container } = render(
      <HepatitisCResultGuidance result={mockResultTemplate} />
    );
    expect(container).toMatchSnapshot();
  });

  const nonPositiveCases = [
    TEST_RESULTS.NEGATIVE,
    TEST_RESULTS.UNDETERMINED,
    TEST_RESULTS.UNKNOWN,
  ];

  test.each(nonPositiveCases)(
    "displays no Hepatitis-C guidance for %p result",
    (testResult) => {
      const mockResult = cloneDeep(mockResultTemplate);
      mockResult.testResult = testResult;
      render(<HepatitisCResultGuidance result={mockResult} />);
      expect(screen.queryByText("For Hepatitis-C:")).not.toBeInTheDocument();
    }
  );
});
