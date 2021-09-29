import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SecurityAnswer } from "./SecurityQuestion";
import "../../../i18n";

describe("Verify Email MFA", () => {
  beforeEach(() => {
    render(<SecurityAnswer />);
  });

  it("can enter a security code", () => {
    userEvent.type(
      screen.getByLabelText("Where did you go for your favorite vacation?", {
        exact: false,
      }),
      "Hawaii"
    );
    userEvent.click(screen.getByText("Continue"));
    expect(screen.queryByText("Enter your answer")).not.toBeInTheDocument();
  });

  it("requires a security code", () => {
    userEvent.click(screen.getByText("Continue"));
    expect(screen.getByText("Enter your answer")).toBeInTheDocument();
  });
});
