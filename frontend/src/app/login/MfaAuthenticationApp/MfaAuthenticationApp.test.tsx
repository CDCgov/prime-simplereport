import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { MfaAuthenticationApp } from "./MfaAuthenticationApp";

describe("Submit Email MFA", () => {
  beforeEach(() => {
    render(<MfaAuthenticationApp />);
  });

  it("can enter a security code", () => {
    userEvent.type(
      screen.getByLabelText("One-time security code", { exact: false }),
      "123"
    );
    userEvent.click(screen.getByText("Submit"));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("requires a security code", () => {
    userEvent.click(screen.getByText("Submit"));
    const error = screen.getByRole("alert");
    expect(error.textContent).toEqual("Error: Enter your security code");
  });
});
