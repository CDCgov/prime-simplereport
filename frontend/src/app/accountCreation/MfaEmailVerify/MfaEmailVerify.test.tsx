import { render, screen, fireEvent } from "@testing-library/react";

import { MfaEmailVerify } from "./MfaEmailVerify";

describe("Verify Email MFA", () => {
  beforeEach(() => {
    render(<MfaEmailVerify email="foo@bar.com" />);
  });

  it("can enter a security code", () => {
    fireEvent.change(
      screen.getByLabelText("One-time security code", { exact: false }),
      {
        target: { value: "123" },
      }
    );
    fireEvent.click(screen.getByText("Submit"));
    expect(
      screen.queryByText("Enter your security code")
    ).not.toBeInTheDocument();
  });

  it("requires a security code", () => {
    fireEvent.click(screen.getByText("Submit"));
    expect(screen.getByText("Enter your security code")).toBeInTheDocument();
  });
});
