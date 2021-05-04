import { render, screen, fireEvent } from "@testing-library/react";

import { MfaEmail } from "./MfaEmail";

describe("MFA Email", () => {
  beforeEach(() => {
    render(<MfaEmail />);
  });

  it("can enter a valid email", () => {
    fireEvent.change(screen.getByLabelText("Email address", { exact: false }), {
      target: { value: "name@email.com" },
    });
    fireEvent.click(screen.getByText("Send code"));
    expect(
      screen.queryByText("Email address is invalid")
    ).not.toBeInTheDocument();
  });

  it("requires a email", () => {
    fireEvent.click(screen.getByText("Send code"));
    expect(screen.getByText("Enter your email address")).toBeInTheDocument();
  });

  it("requires a valid email", () => {
    fireEvent.change(screen.getByLabelText("Email address", { exact: false }), {
      target: { value: "name@email.com" },
    });
    fireEvent.click(screen.getByText("Send code"));
    expect(screen.getByText("Enter a valid email address")).toBeInTheDocument();
  });
});
