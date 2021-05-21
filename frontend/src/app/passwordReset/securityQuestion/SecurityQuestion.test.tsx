import { render, screen, fireEvent } from "@testing-library/react";

import { SecurityAnswer } from "./SecurityQuestion";

describe("Verify Email MFA", () => {
  beforeEach(() => {
    render(<SecurityAnswer />);
  });

  it("can enter a security code", () => {
    fireEvent.change(
      screen.getByLabelText("Where did you go for your favorite vacation?", {
        exact: false,
      }),
      {
        target: { value: "Hawaii" },
      }
    );
    fireEvent.click(screen.getByText("Continue"));
    expect(screen.queryByText("Enter an answer")).not.toBeInTheDocument();
  });

  it("requires a security code", () => {
    fireEvent.click(screen.getByText("Continue"));
    expect(screen.getByText("Enter an answer")).toBeInTheDocument();
  });
});
