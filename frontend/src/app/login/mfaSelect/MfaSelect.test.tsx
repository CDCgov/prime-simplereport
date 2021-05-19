import { render, screen, fireEvent } from "@testing-library/react";

import { MfaSelect } from "./MfaSelect";

describe("MfaSelect", () => {
  beforeEach(() => {
    render(<MfaSelect />);
  });

  it("can choose an mfa option", () => {
    const smsRadio = screen.getByLabelText("Text message (SMS)", {
      exact: false,
    });
    fireEvent.click(smsRadio);
    expect(smsRadio).toBeChecked();
  });

  it("requires an mfa option", () => {
    fireEvent.click(screen.getByText("Sign in"));
    expect(
      screen.getByText("Select an authentication option")
    ).toBeInTheDocument();
  });
});
