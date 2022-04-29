import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import YesNoNotSureRadioGroup from "./YesNoNotSureRadioGroup";

describe("Yes/No/Not Sure RadioGroup", () => {
  const onChangeFn = jest.fn(() => {});
  const onBlurFn = jest.fn(() => {});

  const defaultArgs = {
    legend: "Question with a Yes/No/Not Sure answer?",
    name: "radioGroup1",
    value: undefined,
    onChange: onChangeFn,
    onBlur: onBlurFn,
    validationStatus: undefined,
    errorMessage: "This is an error message.",
    hintText: undefined,
  };

  it("renders component with a hint text", () => {
    render(
      <YesNoNotSureRadioGroup {...defaultArgs} hintText="This is a hint" />
    );
    expect(screen.getByText("This is a hint")).toBeInTheDocument();
  });

  it("renders with an error", () => {
    render(
      <YesNoNotSureRadioGroup {...defaultArgs} validationStatus="error" />
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      defaultArgs.errorMessage
    );
  });

  it("calls function on changed", () => {
    render(<YesNoNotSureRadioGroup {...defaultArgs} />);

    userEvent.click(screen.getByLabelText("Yes"));

    expect(onChangeFn).toHaveBeenCalledWith("YES");
    expect(onBlurFn).not.toHaveBeenCalled();
  });

  it("calls function on blur", () => {
    render(<YesNoNotSureRadioGroup {...defaultArgs} />);

    userEvent.click(screen.getByLabelText("Yes"));
    userEvent.click(screen.getByLabelText("No"));

    expect(onBlurFn).toHaveBeenCalled();
  });
});
