import { render, screen } from "@testing-library/react";
import { cloneDeep } from "lodash";

import { TEST_RESULTS } from "../../testResults/constants";

import "../../../i18n";

import RsvResultGuidance from "./RsvResultGuidance";

describe("RsvResultGuidance", () => {
  const mockResultTemplate = {
    disease: {
      name: "RSV",
    },
    testResult: TEST_RESULTS.POSITIVE,
  } as MultiplexResult;

  it("displays guidance for a positive RSV result", () => {
    const { container } = render(
      <RsvResultGuidance result={mockResultTemplate} />
    );
    expect(container).toMatchSnapshot();
  });

  const nonPositiveCases = [
    TEST_RESULTS.NEGATIVE,
    TEST_RESULTS.UNDETERMINED,
    TEST_RESULTS.UNKNOWN,
  ];

  test.each(nonPositiveCases)(
    "displays no RSV guidance for %p result",
    (testResult) => {
      const mockResult = cloneDeep(mockResultTemplate);
      mockResult.testResult = testResult;
      render(<RsvResultGuidance result={mockResult} />);
      expect(screen.queryByText("For RSV:")).not.toBeInTheDocument();
    }
  );
});
