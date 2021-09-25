import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { MfaSelect } from "./MfaSelect";

describe("MfaSelect", () => {
  beforeEach(() => {
    render(<MfaSelect />);
  });

  it("can choose an mfa option", () => {
    const smsRadio = screen.getByLabelText("Text message (SMS)", {
      exact: false,
    });
    userEvent.click(smsRadio);
    expect(smsRadio).toBeChecked();
  });

  it("requires an mfa option", () => {
    userEvent.click(screen.getByText("Sign in"));
    expect(
      screen.getByText("Select an authentication option")
    ).toBeInTheDocument();
  });
});
