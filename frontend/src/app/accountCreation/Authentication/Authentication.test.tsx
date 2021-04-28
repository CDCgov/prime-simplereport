import { render, screen, fireEvent } from "@testing-library/react";

import { Authentication } from "./Authentication";

describe("Authentication", () => {
  beforeEach(() => {
    render(<Authentication />);
  });

  it("can choose an mfa option", () => {
    const smsRadio = screen.getByLabelText("Text message (SMS)", {
      exact: false,
    });
    fireEvent.click(smsRadio);
    expect(smsRadio).toBeChecked();
  });
});
