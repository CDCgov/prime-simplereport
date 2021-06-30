import { render, screen } from "@testing-library/react";

import NextSteps from "./NextSteps";

describe("NextSteps", () => {
  beforeEach(() => {
    render(<NextSteps />);
  });
  it("renders", () => {
    expect(screen.getByText("Schedule an appt")).toBeInTheDocument();
  });
});
