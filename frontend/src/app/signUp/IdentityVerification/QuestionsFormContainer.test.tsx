import { render, screen } from "@testing-library/react";

import QuestionsFormContainer from "./QuestionsFormContainer";

describe("QuestionsFormContainer", () => {
  beforeEach(() => {
    render(<QuestionsFormContainer />);
  });
  it("show the user that the page is loading", () => {
    expect(screen.getByText("Loading", { exact: false })).toBeInTheDocument();
  });
});
