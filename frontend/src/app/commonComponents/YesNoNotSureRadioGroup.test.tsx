import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import YesNoNotSureRadioGroup from "./YesNoNotSureRadioGroup";

describe("Yes/No/Not Sure RadioGroup", () => {
  const onChangeFn = jest.fn(() => {});
  const onBlurFn = jest.fn(() => {});

  const defaultArgs = {
    legend: "Are you a wizard?",
    name: "hogwartsRadioGroup",
    value: undefined,
    onChange: onChangeFn,
    onBlur: onBlurFn,
    validationStatus: undefined,
    errorMessage: "Don’t let the Muggles get you down.",
    hintText: undefined,
  };

  it("renders component with a hint text", () => {
    const hint = "You are a wizard Harry.";
    render(<YesNoNotSureRadioGroup {...defaultArgs} hintText={hint} />);
    expect(screen.getByText(hint)).toBeInTheDocument();
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
