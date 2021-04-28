import { render, screen, fireEvent } from "@testing-library/react";

import { VerifySecurityCode } from "./VerifySecurityCode";

describe("VerifySecurityCode", () => {
  beforeEach(() => {
    render(<VerifySecurityCode />);
  });

  it("can type a security code", () => {
    fireEvent.change(screen.getByLabelText("One-time security code"), {
      target: { value: "123" },
    });
    expect(screen.getByText("Verify your security code.")).toBeInTheDocument();
  });
});
