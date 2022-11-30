import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import YesNoRadioGroup, {
  boolToYesNoUnknown,
  yesNoUnknownToBool,
} from "./YesNoRadioGroup";

describe("Yes/No/Unknown RadioGroup", () => {
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
    await userEvent.click(screen.getByLabelText("Unknown"));
    expect(onChangeFn).toHaveBeenCalledWith("UNKNOWN");
  });

  it("calls function on blur", async () => {
    render(<YesNoRadioGroup {...defaultArgs} />);

    await userEvent.click(screen.getByLabelText("Yes"));
    await userEvent.click(screen.getByLabelText("No"));
    expect(onBlurFn).toHaveBeenCalled();
  });

  describe("Yes/No/Unknown utility methods", () => {
    it("converts value to bool", () => {
      expect(yesNoUnknownToBool("YES")).toBeTruthy();
      expect(yesNoUnknownToBool("NO")).toBeFalsy();
      expect(yesNoUnknownToBool("UNKNOWN")).toBeNull();
      // @ts-ignore
      expect(yesNoUnknownToBool(undefined)).toBeUndefined();
    });
    it("converts bool to value", () => {
      expect(boolToYesNoUnknown(true)).toBe("YES");
      expect(boolToYesNoUnknown(false)).toBe("NO");
      expect(boolToYesNoUnknown(null)).toBe("UNKNOWN");
      expect(boolToYesNoUnknown(undefined)).toBeUndefined();
    });
  });
});
