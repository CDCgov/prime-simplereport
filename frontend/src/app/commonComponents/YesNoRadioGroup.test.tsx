import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import YesNoRadioGroup, { boolToYesNo, yesNoToBool } from "./YesNoRadioGroup";

describe("Yes/No RadioGroup", () => {
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
    render(<YesNoRadioGroup {...defaultArgs} hintText={hint} />);
    expect(screen.getByText(hint)).toBeInTheDocument();
  });

  it("renders with an error", () => {
    render(<YesNoRadioGroup {...defaultArgs} validationStatus="error" />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      defaultArgs.errorMessage
    );
  });

  it("calls function on change with correct value", async () => {
    render(<YesNoRadioGroup {...defaultArgs} />);

    await userEvent.click(screen.getByLabelText("Yes"));
    expect(onChangeFn).toHaveBeenCalledWith("YES");
    await userEvent.click(screen.getByLabelText("No"));
    expect(onChangeFn).toHaveBeenCalledWith("NO");
  });

  it("calls function on blur", async () => {
    render(<YesNoRadioGroup {...defaultArgs} />);

    await userEvent.click(screen.getByLabelText("Yes"));
    await userEvent.click(screen.getByLabelText("No"));
    expect(onBlurFn).toHaveBeenCalled();
  });

  describe("Yes/No utility methods", () => {
    it("converts value to bool", () => {
      expect(yesNoToBool("YES")).toBeTruthy();
      expect(yesNoToBool("NO")).toBeFalsy();
      // @ts-ignore
      expect(yesNoToBool(undefined)).toBeUndefined();
    });
    it("converts bool to value", () => {
      expect(boolToYesNo(true)).toBe("YES");
      expect(boolToYesNo(false)).toBe("NO");
      expect(boolToYesNo(null)).toBeUndefined();
      expect(boolToYesNo(undefined)).toBeUndefined();
    });
  });
});
