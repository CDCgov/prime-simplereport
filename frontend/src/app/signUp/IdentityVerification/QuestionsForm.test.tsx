import { render, screen, waitFor } from "@testing-library/react";
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
    it("enables the submit button", () => {
      userEvent.click(screen.getByLabelText("2002", { exact: false }));
      expect(screen.getByText("Submit")).not.toHaveAttribute("disabled");
    });
    describe("focusing and not adding a value", () => {
      it("shows a single error", async () => {
        userEvent.click(screen.getByLabelText("2002", { exact: false }));
        screen.getByLabelText("ELECTRICIAN", { exact: false }).focus();
        screen.getByText("Submit", { exact: false }).focus();
        await waitFor(() => {
          expect(screen.queryAllByText("This field is required").length).toBe(
            1
          );
        });
      });
    });
    describe("On submit", () => {
      it("shows an error", async () => {
        userEvent.click(screen.getByLabelText("2002", { exact: false }));
        userEvent.click(
          screen.queryAllByText("Submit", {
            exact: false,
          })[0]
        );
        await waitFor(() => {
          expect(screen.queryAllByText("This field is required").length).toBe(
            4
          );
        });
      });
      it("does not call the onSubmit callback", async () => {
        userEvent.click(screen.getByLabelText("2002", { exact: false }));
        userEvent.click(
          screen.queryAllByText("Submit", {
            exact: false,
          })[0]
        );
        await waitFor(() => {
          expect(onSubmit).not.toHaveBeenCalled();
        });
      });
    });
  });
  describe("Completed form", () => {
    describe("On submit", () => {
      it("does not show an error", async () => {
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
        userEvent.click(
          screen.queryAllByText("Submit", {
            exact: false,
          })[0]
        );
        await waitFor(() => {
          expect(screen.queryAllByText("This field is required").length).toBe(
            0
          );
        });
      });
      it("calls the onSubmit callback", async () => {
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
        userEvent.click(
          screen.queryAllByText("Submit", {
            exact: false,
          })[0]
        );
        await waitFor(() => {
          expect(onSubmit).toHaveBeenCalled();
        });
      });
    });
  });
});
