import { render, screen, fireEvent, act } from "@testing-library/react";

import QuestionsForm from "./QuestionsForm";
import { exampleQuestionSet } from "./constants";

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
});
