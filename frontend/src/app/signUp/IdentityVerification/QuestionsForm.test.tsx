import { render, screen, fireEvent, act } from "@testing-library/react";

import { exampleQuestionSet } from "./constants";
import QuestionsForm from "./QuestionsForm";

describe("QuestionsForm", () => {
  let onSubmit: jest.Mock;

  beforeEach(() => {
    onSubmit = jest.fn();

    render(
      <QuestionsForm
        questionSet={exampleQuestionSet}
        saving={false}
        onSubmit={onSubmit}
      />
    );
  });
  it("initializes with the submit button disabled", () => {
    expect(screen.getByText("Submit")).toHaveAttribute("disabled");
  });
  describe("One filed entered", () => {
    beforeEach(() => {
      fireEvent.click(screen.getByLabelText("2002", { exact: false }), {
        target: { value: "1" },
      });
    });
    it("enables the submit button", () => {
      expect(screen.getByText("Submit")).not.toHaveAttribute("disabled");
    });
    describe("focusing and not adding a value", () => {
      beforeEach(async () => {
        await act(async () => {
          await screen.getByLabelText("ELECTRICIAN", { exact: false }).focus();
          await screen.getByText("Submit", { exact: false }).focus();
        });
      });
      it("shows a single error", () => {
        expect(screen.queryAllByText("This field is required").length).toBe(1);
      });
    });
    describe("On submit", () => {
      beforeEach(async () => {
        await act(async () => {
          await fireEvent.click(
            screen.queryAllByText("Submit", {
              exact: false,
            })[0]
          );
        });
      });
      it("shows an error", () => {
        expect(screen.queryAllByText("This field is required").length).toBe(4);
      });
      it("does not call the onSubmit callback", () => {
        expect(onSubmit).not.toHaveBeenCalled();
      });
    });
  });
  describe("Completed form", () => {
    beforeEach(() => {
      fireEvent.click(screen.getByLabelText("2002", { exact: false }), {
        target: { value: "1" },
      });
      fireEvent.click(
        screen.getByLabelText("OPTICIAN / OPTOMETRIST", { exact: false }),
        {
          target: { value: "3" },
        }
      );
      fireEvent.click(
        screen.getByLabelText("MID AMERICA MORTGAGE", { exact: false }),
        {
          target: { value: "3" },
        }
      );
      fireEvent.click(screen.getByLabelText("TWO", { exact: false }), {
        target: { value: "2" },
      });
      fireEvent.click(
        screen.getByLabelText("AGUA DULCE HIGH SCHOOL", { exact: false }),
        {
          target: { value: "4" },
        }
      );
    });

    describe("On submit", () => {
      beforeEach(async () => {
        await act(async () => {
          await fireEvent.click(
            screen.queryAllByText("Submit", {
              exact: false,
            })[0]
          );
        });
      });
      it("does not shows an error", () => {
        expect(screen.queryAllByText("This field is required").length).toBe(0);
      });
      it("calls the onSubmit callback", () => {
        expect(onSubmit).toHaveBeenCalled();
      });
    });
  });
});
