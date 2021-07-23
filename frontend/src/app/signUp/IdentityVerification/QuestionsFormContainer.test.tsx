import { render, screen } from "@testing-library/react";

import QuestionsFormContainer from "./QuestionsFormContainer";
import { initPersonalDetails } from "./utils";

describe("QuestionsFormContainer", () => {
  beforeEach(() => {
    render(<QuestionsFormContainer personalDetails={initPersonalDetails()} />);
  });
  it("show the user that the page is loading", () => {
    expect(screen.getByText("Loading", { exact: false })).toBeInTheDocument();
  });
});
