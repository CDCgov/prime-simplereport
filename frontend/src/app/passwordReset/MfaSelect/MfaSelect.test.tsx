import { render, screen, fireEvent } from "@testing-library/react";

import { MfaSelect } from "./MfaSelect";

describe("MFA Email", () => {
  beforeEach(() => {
    render(<MfaSelect />);
  });

  it("can enter a valid email", () => {
    fireEvent.change(screen.getByLabelText("Email address", { exact: false }), {
      target: { value: "name@email.com" },
    });
    fireEvent.click(screen.getByText("Continue"));
    expect(
      screen.queryByText("Enter a valid email address")
    ).not.toBeInTheDocument();
  });

  it("requires a email", () => {
    fireEvent.click(screen.getByText("Continue"));
    expect(screen.getByText("Enter your email address")).toBeInTheDocument();
  });

  it("requires a valid email", () => {
    fireEvent.change(screen.getByLabelText("Email address", { exact: false }), {
      target: { value: "notanemail" },
    });
    fireEvent.click(screen.getByText("Continue"));
    expect(screen.getByText("Enter a valid email address")).toBeInTheDocument();
  });
});
