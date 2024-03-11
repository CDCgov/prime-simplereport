import { render, screen } from "@testing-library/react";

import NextSteps from "./NextSteps";

describe("NextSteps", () => {
  it("renders", () => {
    render(<NextSteps />);
    expect(
      screen.getByText("Experian was unable to verify your identity", {
        exact: false,
      })
    ).toBeInTheDocument();
  });
});
