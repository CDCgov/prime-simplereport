import { render, screen } from "@testing-library/react";

import NextSteps from "./NextSteps";

describe("NextSteps", () => {
  it("renders", () => {
    render(<NextSteps />);
    expect(
      screen.getByText("Identity verification needed", {
        exact: false,
      })
    ).toBeInTheDocument();
  });
});
