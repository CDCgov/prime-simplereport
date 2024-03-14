import { fireEvent, render, screen } from "@testing-library/react";

import SignUpGoals from "./SignUpGoals";

describe("SignUpGoals", () => {
  it("renders with the submit button disabled", () => {
    render(<SignUpGoals />);
    expect(screen.getByText("Continue")).toBeDisabled();
  });

  it("requires a selection", async () => {
    render(<SignUpGoals />);
    expect(screen.getByText("Continue")).toBeDisabled();
    fireEvent.click(
      screen.getByText("My organization is already using SimpleReport")
    );
    expect(screen.getByText("Continue")).toBeEnabled();
  });

  it("redirects to request access page when first option is selected", async () => {
    render(<SignUpGoals />);
    fireEvent.click(
      screen.getByText("My organization is already using SimpleReport")
    );
    fireEvent.click(screen.getByText("Continue"));
    expect(await screen.findByText("Request access to SimpleReport"));
  });

  it("redirects to org sign-up page when second option is selected", async () => {
    render(<SignUpGoals />);
    fireEvent.click(screen.getByText("My organization is new to SimpleReport"));
    fireEvent.click(screen.getByText("Continue"));
    expect(
      await screen.findByText("Sign up for SimpleReport in three steps", {
        exact: false,
      })
    );
  });

  it("redirects to request test result page when third option is selected", async () => {
    render(<SignUpGoals />);
    fireEvent.click(screen.getByText("I’m trying to get my test results"));
    fireEvent.click(screen.getByText("Continue"));
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
