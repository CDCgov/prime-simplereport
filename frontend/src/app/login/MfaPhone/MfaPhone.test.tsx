import { render, screen, fireEvent } from "@testing-library/react";

import { MfaPhone } from "./MfaPhone";

describe("Submit Email MFA", () => {
  beforeEach(() => {
    render(<MfaPhone phoneNumber="(530) 867-5309" />);
  });

  it("can enter a security code", () => {
    fireEvent.change(
      screen.getByLabelText("One-time security code", { exact: false }),
      {
        target: { value: "123" },
      }
    );
    fireEvent.click(screen.getByText("Submit"));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("requires a security code", () => {
    fireEvent.click(screen.getByText("Submit"));
    const error = screen.getByRole("alert");
    expect(error.textContent).toEqual("Error: Enter your security code");
  });
});
