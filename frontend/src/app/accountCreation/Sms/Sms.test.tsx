import { render, screen, fireEvent } from "@testing-library/react";

import { Sms } from "./Sms";

describe("Sms", () => {
  beforeEach(() => {
    render(<Sms />);
  });

  it("can type a phone number", () => {
    fireEvent.change(screen.getByLabelText("Phone number"), {
      target: { value: "(670) 867-5309" },
    });
    expect(
      screen.getByText("Get your security code via text message (SMS).")
    ).toBeInTheDocument();
  });
});
