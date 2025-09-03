import { render, screen } from "@testing-library/react";

import NextSteps from "./NextSteps";

describe("NextSteps", () => {
  it("renders", () => {
    render(<NextSteps />);
    expect(
      screen.getByText("We were unable to verify your identity", {
        exact: false,
      })
    ).toBeInTheDocument();
  });
});
