import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

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

  it("initializes with the submit button enabled", () => {
    expect(screen.getByText("Submit")).toBeEnabled();
  });

  describe("tests with fake timers", () => {
    beforeAll(() => {
      jest.useFakeTimers();
    });

    it("initializes with a counter and starts counting down", async () => {
      expect(screen.getByText("5:00")).toBeInTheDocument();
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });
      expect(screen.getByText("4:59")).toBeInTheDocument();
      await act(async () => {
        jest.advanceTimersByTime(2000);
      });
    });

    afterAll(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });
  });

  describe("One field entered", () => {
    it("enables the submit button", async () => {
      fireEvent.click(screen.getByLabelText("2002", { exact: false }));
      await waitFor(() => expect(screen.getByText("Submit")).toBeEnabled());
    });

    describe("On submit", () => {
      it("shows errors for required fields", async () => {
        fireEvent.click(screen.getByLabelText("2002", { exact: false }));
        fireEvent.click(
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
        fireEvent.click(screen.getByLabelText("2002", { exact: false }));
        fireEvent.click(
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
        fireEvent.click(screen.getByLabelText("2002", { exact: false }));
        fireEvent.click(
          screen.getByLabelText("OPTICIAN / OPTOMETRIST", { exact: false })
        );
        fireEvent.click(
          screen.getByLabelText("MID AMERICA MORTGAGE", { exact: false })
        );
        fireEvent.click(screen.getByLabelText("TWO", { exact: false }));
        fireEvent.click(
          screen.getByLabelText("AGUA DULCE HIGH SCHOOL", { exact: false })
        );
        fireEvent.click(
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
        fireEvent.click(screen.getByLabelText("2002", { exact: false }));
        fireEvent.click(
          screen.getByLabelText("OPTICIAN / OPTOMETRIST", { exact: false })
        );
        fireEvent.click(
          screen.getByLabelText("MID AMERICA MORTGAGE", { exact: false })
        );
        fireEvent.click(screen.getByLabelText("TWO", { exact: false }));
        fireEvent.click(
          screen.getByLabelText("AGUA DULCE HIGH SCHOOL", { exact: false })
        );
        fireEvent.click(
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
