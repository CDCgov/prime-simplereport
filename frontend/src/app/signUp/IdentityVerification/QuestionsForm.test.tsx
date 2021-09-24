import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { exampleQuestionSet } from "./constants";
import QuestionsForm from "./QuestionsForm";

describe("QuestionsForm", () => {
  let onSubmit: jest.Mock;
  let onFail: jest.Mock;

  beforeEach(() => {
    onSubmit = jest.fn();
    onFail = jest.fn();

    render(
      <QuestionsForm
        questionSet={exampleQuestionSet}
        saving={false}
        onSubmit={onSubmit}
        onFail={onFail}
      />
    );
  });
  it("initializes with the submit button disabled", () => {
    expect(screen.getByText("Submit")).toHaveAttribute("disabled");
  });
  it("initializes with a counter and starts counting down", async () => {
    expect(screen.getByText("5:00")).toBeInTheDocument();
    expect(await screen.findByText("4:59")).toBeInTheDocument();
  });
  describe("One field entered", () => {
    beforeEach(() => {
      userEvent.click(screen.getByLabelText("2002", { exact: false }));
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
          await userEvent.click(
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
      userEvent.click(screen.getByLabelText("2002", { exact: false }));
      userEvent.click(
        screen.getByLabelText("OPTICIAN / OPTOMETRIST", { exact: false })
      );
      userEvent.click(
        screen.getByLabelText("MID AMERICA MORTGAGE", { exact: false })
      );
      userEvent.click(screen.getByLabelText("TWO", { exact: false }));
      userEvent.click(
        screen.getByLabelText("AGUA DULCE HIGH SCHOOL", { exact: false })
      );
    });

    describe("On submit", () => {
      beforeEach(async () => {
        await act(async () => {
          await userEvent.click(
            screen.queryAllByText("Submit", {
              exact: false,
            })[0]
          );
        });
      });
      it("does not show an error", () => {
        expect(screen.queryAllByText("This field is required").length).toBe(0);
      });
      it("calls the onSubmit callback", () => {
        expect(onSubmit).toHaveBeenCalled();
      });
    });
  });
});
