import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { VerifyPhone } from "./VerifyPhone";

describe("Verify Email MFA", () => {
  beforeEach(() => {
    render(<VerifyPhone phoneNumber="(530) 867-5309" />);
  });

  it("can enter a security code", () => {
    userEvent.type(
      screen.getByLabelText("One-time security code", { exact: false }),
      "123"
    );
    userEvent.click(screen.getByText("Submit"));
    expect(
      screen.queryByText("Enter your security code")
    ).not.toBeInTheDocument();
  });

  it("requires a security code", () => {
    userEvent.click(screen.getByText("Submit"));
    expect(screen.getByText("Enter your security code")).toBeInTheDocument();
  });
});
