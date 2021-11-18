import { render, screen } from "@testing-library/react";

import SignUpGoals from "./SignUpGoals";

describe("SignUpGoals", () => {
  beforeEach(() => {
    render(<SignUpGoals />);
  });
  it("renders with the submit button enabled", () => {
    expect(screen.getByText("Continue")).not.toHaveAttribute("disabled");
  });

  it("requires a selection", () => {
    screen.getByText("Continue").click();
    expect(screen.getByText("Please select an option")).toBeInTheDocument();
  });

  it("redirects to request access page when first option is selected", () => {
    screen.getByText("My organization is already using SimpleReport").click();
    screen.getByText("Continue").click();
    expect(
      screen.getByText("Request access to SimpleReport")
    ).toBeInTheDocument();
  });

  it("redirects to org sign-up page when second option is selected", () => {
    screen.getByText("My organization is new to SimpleReport").click();
    screen.getByText("Continue").click();
    expect(
      screen.getByText("Sign up for SimpleReport in three steps", {
        exact: false,
      })
    ).toBeInTheDocument();
  });

  it("redirects to request test result page when third option is selected", () => {
    screen.getByText("I’m trying to get my COVID-19 test results").click();
    screen.getByText("Continue").click();
    expect(
      screen.getByText("COVID-19 test results are sent via email or SMS", {
        exact: false,
      })
    ).toBeInTheDocument();
  });
});
