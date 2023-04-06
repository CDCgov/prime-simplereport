import { render, screen } from "@testing-library/react";

import SignUpGoals from "./SignUpGoals";

describe("SignUpGoals", () => {
  beforeEach(() => {
    render(<SignUpGoals />);
  });
  it("renders with the submit button enabled", () => {
    expect(screen.getByText("Continue")).toBeEnabled();
  });

  it("requires a selection", async () => {
    screen.getByText("Continue").click();
    expect(
      await screen.findByText(/Please select an option/i)
    ).toBeInTheDocument();
  });

  it("redirects to request access page when first option is selected", async () => {
    screen.getByText("My organization is already using SimpleReport").click();
    screen.getByText("Continue").click();
    expect(await screen.findByText("Request access to SimpleReport"));
  });

  it("redirects to org sign-up page when second option is selected", async () => {
    screen.getByText("My organization is new to SimpleReport").click();
    screen.getByText("Continue").click();
    expect(
      await screen.findByText("Sign up for SimpleReport in three steps", {
        exact: false,
      })
    );
  });

  it("redirects to request test result page when third option is selected", async () => {
    screen.getByText("I’m trying to get my COVID-19 test results").click();
    screen.getByText("Continue").click();
    expect(
      await screen.findByText(
        "COVID-19 test results are sent via email or SMS",
        {
          exact: false,
        }
      )
    );
  });
});
