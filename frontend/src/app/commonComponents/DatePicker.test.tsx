import { render, screen } from "@testing-library/react";

import { DatePicker } from "./DatePicker";

describe("DatePicker", () => {
  describe("div", () => {
    it("should have the class passed in when className has a value", () => {
      render(
        <DatePicker name={"date"} label={"label"} className={"myClass"} />
      );
      expect(
        screen.getByText("label").parentElement
      ).toHaveClass("myClass usa-form-group", { exact: true });
    });
  });
  describe("label", () => {
    it("should have the class passed in when labelClassName has a value", () => {
      render(
        <DatePicker name={"date"} label={"label"} labelClassName={"myClass"} />
      );
      expect(screen.getByText("label")).toHaveClass("myClass usa-label", {
        exact: true,
      });
    });
    it("should have the label-sr-only class when labelSrOnly is true", () => {
      render(<DatePicker name={"date"} label={"label"} labelSrOnly={true} />);
      expect(screen.getByText("label")).toHaveClass("usa-sr-only usa-label", {
        exact: true,
      });
    });
  });
  describe("required", () => {
    it("should insert a required star and set required on input", () => {
      render(<DatePicker name={"date"} label={"label"} required={true} />);
      expect(screen.getByText("*")).toHaveClass("usa-hint usa-hint--required", {
        exact: true,
      });
      expect(screen.getByTestId("date-picker-external-input")).toBeRequired();
    });
    it("should be optional", () => {
      render(<DatePicker name={"date"} label={"label"} required={false} />);
      expect(screen.queryByText("*")).not.toBeInTheDocument();
    });
  });
  describe("disabled", () => {
    it("should be applied to the input and button", () => {
      render(<DatePicker name={"date"} label={"label"} disabled={true} />);
      expect(screen.getByTestId("date-picker-external-input")).toBeDisabled();
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });
  describe("hint", () => {
    it("should be present when noHint is not present", () => {
      render(<DatePicker name={"date"} label={"label"} />);
      expect(screen.getByText("mm/dd/yyyy")).toBeInTheDocument();
    });
    it("should not be present when noHint is true", () => {
      render(<DatePicker name={"date"} label={"label"} noHint={true} />);
      expect(screen.queryByText("mm/dd/yyyy")).not.toBeInTheDocument();
    });
  });
  describe("validationStatus", () => {
    describe("when equal to error", () => {
      it("should apply error message and classes", () => {
        render(
          <DatePicker
            name={"date"}
            label={"label"}
            validationStatus={"error"}
            errorMessage={<span>hello world</span>}
          />
        );
        expect(
          screen.getByText("label").parentElement
        ).toHaveClass("usa-form-group usa-form-group--error", { exact: true });
        expect(
          screen.getByText("label")
        ).toHaveClass("usa-label usa-label--error", { exact: true });
        expect(screen.getByText("Error:").parentElement).toHaveAttribute(
          "id",
          "error_date"
        );
        expect(screen.getByText("hello world")).toBeInTheDocument();
      });
    });
    it("should not have error message when validationStatus is not present", () => {
      render(<DatePicker name={"date"} label={"label"} />);
      expect(screen.queryByText("Error:")).not.toBeInTheDocument();
    });
  });
  describe("ariaHidden", () => {
    it("should apply aria-hidden true to all", () => {
      render(
        <DatePicker
          name={"date"}
          label={"label"}
          ariaHidden={true}
          noHint={false}
          validationStatus={"error"}
        />
      );
      expect(screen.getByText("label")).toHaveAttribute("aria-hidden", "true");
      expect(screen.getByText("mm/dd/yyyy")).toHaveAttribute(
        "aria-hidden",
        "true"
      );
      expect(screen.getByText("Error:")).toHaveAttribute("aria-hidden", "true");
    });
  });
});
