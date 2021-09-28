import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { EmailConfirm } from "./EmailConfirm";

describe("MFA Email", () => {
  beforeEach(() => {
    render(<EmailConfirm />);
  });

  it("can enter a valid email", () => {
    userEvent.type(
      screen.getByLabelText("Email address", { exact: false }),
      "name@email.com"
    );
    userEvent.click(screen.getByText("Continue"));
    expect(
      screen.queryByText("Enter a valid email address")
    ).not.toBeInTheDocument();
  });

  it("requires a email", () => {
    userEvent.click(screen.getByText("Continue"));
    expect(screen.getByText("Enter your email address")).toBeInTheDocument();
  });

  it("requires a valid email", () => {
    userEvent.type(
      screen.getByLabelText("Email address", { exact: false }),
      "notanemail"
    );
    userEvent.click(screen.getByText("Continue"));
    expect(screen.getByText("Enter a valid email address")).toBeInTheDocument();
  });
});
