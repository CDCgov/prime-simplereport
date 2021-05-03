import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SecurityQuestion } from "./SecurityQuestion";

describe("SecurityQuestion", () => {
  beforeEach(() => {
    render(<SecurityQuestion />);
  });

  it("can choose a security question and type an answer", () => {
    userEvent.selectOptions(
      screen.getByLabelText("Security question", { exact: false }),
      ["What’s your favorite book?"]
    );
    fireEvent.change(screen.getByLabelText("Answer", { exact: false }), {
      target: { value: "Lord of the Rings" },
    });
    expect(screen.getByText("What’s your favorite book?")).toBeInTheDocument();
  });

  it("requires a security question", () => {
    fireEvent.change(screen.getByLabelText("Answer", { exact: false }), {
      target: { value: "Lord of the Rings" },
    });
    fireEvent.click(screen.getByText("Continue"));
    expect(screen.getByText("Enter a security question")).toBeInTheDocument();
  });

  it("requires a security answer", () => {
    userEvent.selectOptions(
      screen.getByLabelText("Security question", { exact: false }),
      ["What’s your favorite book?"]
    );
    fireEvent.click(screen.getByText("Continue"));
    expect(screen.getByText("Enter a security answer")).toBeInTheDocument();
  });
});
