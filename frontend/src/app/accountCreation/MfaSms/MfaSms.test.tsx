import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { MfaSms } from "./MfaSms";

describe("SMS MFA", () => {
  beforeEach(() => {
    render(<MfaSms />);
  });

  it("can enter a valid phone number", async () => {
    await waitFor(() => {
      fireEvent.change(
        screen.getByLabelText("Phone number", { exact: false }),
        {
          target: { value: "(910) 867-5309" },
        }
      );
      fireEvent.click(screen.getByText("Send code"));
    });

    expect(
      screen.queryByText("Phone number is invalid")
    ).not.toBeInTheDocument();
  });

  it("requires a phone number", () => {
    fireEvent.click(screen.getByText("Send code"));
    expect(screen.getByText("Enter your phone number")).toBeInTheDocument();
  });

  it("requires a valid phone number", () => {
    fireEvent.change(screen.getByLabelText("Phone number", { exact: false }), {
      target: { value: "(555) 555-5555" },
    });
    fireEvent.click(screen.getByText("Send code"));
    expect(screen.getByText("Enter a valid phone number")).toBeInTheDocument();
  });
});
