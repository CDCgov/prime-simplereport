import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { exampleQuestionSet } from "./constants";
import QuestionsForm from "./QuestionsForm";
import { answerIdVerificationQuestions } from "./QuestionsFormContainer.test";

describe("QuestionsForm", () => {
  let onSubmit: jest.Mock;
  let onFail: jest.Mock;

  const renderWithUser = () => ({
    user: userEvent.setup(),
    ...render(
      <MemoryRouter>
        <QuestionsForm
          questionSet={exampleQuestionSet}
          saving={false}
          onSubmit={onSubmit}
          onFail={onFail}
        />
      </MemoryRouter>
    ),
  });

  beforeEach(() => {
    onSubmit = jest.fn();
    onFail = jest.fn();
  });

  it("initializes with the submit button enabled", () => {
    renderWithUser();
    expect(screen.getByText("Submit")).toBeEnabled();
  });

  it("initializes with a counter and starts counting down", async () => {
    jest.useFakeTimers();
    renderWithUser();
    expect(screen.getByText("5:00")).toBeInTheDocument();
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText("4:59")).toBeInTheDocument();
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("enables the submit button when one field completed", async () => {
    const { user } = renderWithUser();
    await user.click(screen.getByLabelText("2002", { exact: false }));
    await waitFor(() => expect(screen.getByText("Submit")).toBeEnabled());
  });

  it("shows errors for required fields on submit of incomplete form", async () => {
    const { user } = renderWithUser();
    await user.click(screen.getByLabelText("2002", { exact: false }));
    await user.click(
      screen.queryAllByText("Submit", {
        exact: false,
      })[0]
    );
    await waitFor(() => {
      expect(screen.queryAllByText("This field is required").length).toBe(4);
    });
  });

  it("does not call the onSubmit callback", async () => {
    const { user } = renderWithUser();
    await user.click(screen.getByLabelText("2002", { exact: false }));
    await user.click(
      screen.queryAllByText("Submit", {
        exact: false,
      })[0]
    );
    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  it("does not show error on submit of completed form", async () => {
    const { user } = renderWithUser();
    await fillAndSubmitIdVerificationQuestions(user);
    await waitFor(() => {
      expect(screen.queryAllByText("This field is required").length).toBe(0);
    });
  });

  it("calls the onSubmit callback on submit of completed form", async () => {
    const { user } = renderWithUser();
    await fillAndSubmitIdVerificationQuestions(user);
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });
});

const fillAndSubmitIdVerificationQuestions = async (user: UserEvent) => {
  await answerIdVerificationQuestions(user);
  await user.click(
    screen.queryAllByText("Submit", {
      exact: false,
    })[0]
  );
};
