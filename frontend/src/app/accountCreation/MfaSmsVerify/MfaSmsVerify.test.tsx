import { render, screen, fireEvent } from "@testing-library/react";

import { MfaSmsVerify } from "./MfaSmsVerify";

describe("Verify SMS MFA", () => {
  beforeEach(() => {
    render(<MfaSmsVerify />);
  });

  it("can type a security code", () => {
    fireEvent.change(screen.getByLabelText("One-time security code"), {
      target: { value: "123" },
    });
    expect(screen.getByText("Verify your security code.")).toBeInTheDocument();
  });
});
