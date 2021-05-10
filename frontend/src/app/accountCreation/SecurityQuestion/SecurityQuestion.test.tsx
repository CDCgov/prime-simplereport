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
      ["In what city or town was your first job?"]
    );
    fireEvent.change(screen.getByLabelText("Answer", { exact: false }), {
      target: { value: "New York" },
    });
    expect(
      screen.getByText("In what city or town was your first job?")
    ).toBeInTheDocument();
  });

  it("requires a security question", () => {
    fireEvent.change(screen.getByLabelText("Answer", { exact: false }), {
      target: { value: "New York" },
    });
    fireEvent.click(screen.getByText("Continue"));
    expect(screen.getByText("Enter a security question")).toBeInTheDocument();
  });

  it("requires a security answer", () => {
    userEvent.selectOptions(
      screen.getByLabelText("Security question", { exact: false }),
      ["In what city or town was your first job?"]
    );
    fireEvent.click(screen.getByText("Continue"));
    expect(screen.getByText("Enter a security answer")).toBeInTheDocument();
  });
});
