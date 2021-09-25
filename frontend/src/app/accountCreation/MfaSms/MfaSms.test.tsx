import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { MfaSms } from "./MfaSms";

describe("SMS MFA", () => {
  beforeEach(() => {
    render(<MfaSms />);
  });

  it("can enter a valid phone number", async () => {
    await waitFor(() => {
      userEvent.type(
        screen.getByLabelText("Phone number", { exact: false }),
        "(910) 867-5309"
      );
      userEvent.click(screen.getByText("Send code"));
    });

    expect(
      screen.queryByText("Phone number is invalid")
    ).not.toBeInTheDocument();
  });

  it("requires a phone number", () => {
    userEvent.click(screen.getByText("Send code"));
    expect(screen.getByText("Enter your phone number")).toBeInTheDocument();
  });

  it("requires a valid phone number", () => {
    userEvent.type(
      screen.getByLabelText("Phone number", { exact: false }),
      "(555) 555-5555"
    );
    userEvent.click(screen.getByText("Send code"));
    expect(screen.getByText("Enter a valid phone number")).toBeInTheDocument();
  });
});
