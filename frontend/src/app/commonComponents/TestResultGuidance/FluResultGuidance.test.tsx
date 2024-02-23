import { render, screen } from "@testing-library/react";
import { cloneDeep } from "lodash";

import { TEST_RESULTS } from "../../testResults/constants";

import "../../../i18n";

import FluResultGuidance from "./FluResultGuidance";

describe("FluResultGuidance", () => {
  const mockResultTemplate = {
    disease: {
      name: "FLU A",
    },
    testResult: TEST_RESULTS.POSITIVE,
  } as MultiplexResult;

  it("displays guidance for a positive flu result", () => {
    const { container } = render(
      <FluResultGuidance result={mockResultTemplate} />
    );
    expect(container).toMatchSnapshot();
  });

  const nonPositiveCases = [
    TEST_RESULTS.NEGATIVE,
    TEST_RESULTS.UNDETERMINED,
    TEST_RESULTS.UNKNOWN,
  ];

  test.each(nonPositiveCases)(
    "displays no flu guidance for %p result",
    (testResult) => {
      const mockResult = cloneDeep(mockResultTemplate);
      mockResult.testResult = testResult;
      render(<FluResultGuidance result={mockResult} />);
      expect(screen.queryByText("For flu A and B:")).not.toBeInTheDocument();
    }
  );
});
