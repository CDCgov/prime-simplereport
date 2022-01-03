import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { MfaPhone } from "./MfaPhone";

describe("Submit Email MFA", () => {
  beforeEach(() => {
    render(<MfaPhone phoneNumber="(530) 867-5309" />);
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
    expect(error).toHaveTextContent("Error: Enter your security code");
  });
});
