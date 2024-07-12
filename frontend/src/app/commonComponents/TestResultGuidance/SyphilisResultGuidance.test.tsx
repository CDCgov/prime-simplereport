import { render, screen } from "@testing-library/react";
import { cloneDeep } from "lodash";

import "../../../i18n";

import { MULTIPLEX_DISEASES, TEST_RESULTS } from "../../testResults/constants";

import SyphilisResultGuidance from "./SyphilisResultGuidance";

describe("SyphilisResultGuidance", () => {
  const mockResultTemplate = {
    disease: {
      name: MULTIPLEX_DISEASES.SYPHILIS,
    },
    testResult: TEST_RESULTS.POSITIVE,
  } as MultiplexResult;

  it("displays guidance for a positive RSV result", () => {
    const { container } = render(
      <SyphilisResultGuidance result={mockResultTemplate} />
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
      render(<SyphilisResultGuidance result={mockResult} />);
      expect(screen.queryByText("For Syphilis")).not.toBeInTheDocument();
    }
  );
});
