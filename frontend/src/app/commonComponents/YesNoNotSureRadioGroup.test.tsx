import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import YesNoNotSureRadioGroup, {
  boolToYesNoNotSure,
  yesNoNotSureToBool,
} from "./YesNoNotSureRadioGroup";

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

  it("calls function on change with correct value", async () => {
    render(<YesNoNotSureRadioGroup {...defaultArgs} />);

    await userEvent.click(screen.getByLabelText("Yes"));
    expect(onChangeFn).toHaveBeenCalledWith("YES");
    await userEvent.click(screen.getByLabelText("No"));
    expect(onChangeFn).toHaveBeenCalledWith("NO");
    await userEvent.click(screen.getByLabelText("Not sure"));
    expect(onChangeFn).toHaveBeenCalledWith("NOT_SURE");
  });

  it("calls function on blur", async () => {
    render(<YesNoNotSureRadioGroup {...defaultArgs} />);

    await userEvent.click(screen.getByLabelText("Yes"));
    await userEvent.click(screen.getByLabelText("No"));
    expect(onBlurFn).toHaveBeenCalled();
  });

  describe("Yes/No/Not Sure utility methods", () => {
    it("converts value to bool", () => {
      expect(yesNoNotSureToBool("YES")).toBeTruthy();
      expect(yesNoNotSureToBool("NO")).toBeFalsy();
      expect(yesNoNotSureToBool("NOT_SURE")).toBeNull();
      // @ts-ignore
      expect(yesNoNotSureToBool(undefined)).toBeUndefined();
    });
    it("converts bool to value", () => {
      expect(boolToYesNoNotSure(true)).toBe("YES");
      expect(boolToYesNoNotSure(false)).toBe("NO");
      expect(boolToYesNoNotSure(null)).toBe("NOT_SURE");
      expect(boolToYesNoNotSure(undefined)).toBeUndefined();
    });
  });
});
