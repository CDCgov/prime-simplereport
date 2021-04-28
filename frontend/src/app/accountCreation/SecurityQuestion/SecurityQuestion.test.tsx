import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SecurityQuestion } from "./SecurityQuestion";

describe("SecurityQuestion", () => {
  beforeEach(() => {
    render(<SecurityQuestion />);
  });

  it("can choose a security question and type an answer", () => {
    userEvent.selectOptions(screen.getByLabelText("Security question"), [
      "What’s your favorite book?",
    ]);
    fireEvent.change(screen.getByLabelText("Answer"), {
      target: { value: "Lord of the Rings" },
    });
    expect(screen.getByText("What’s your favorite book?")).toBeInTheDocument();
  });
});
