import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";

import QuestionsFormContainer from "./QuestionsFormContainer";
import { initPersonalDetails } from "./utils";

jest.mock("../SignUpApi", () => {
  const { exampleQuestionSet } = require("./constants");
  return {
    SignUpApi: {
      getQuestions: (request: IdentityVerificationRequest) => {
        if (request.orgExternalId === "slow") {
          return setTimeout(() => {
            return { questionSet: exampleQuestionSet, sessionId: "foo" };
          }, 10000);
        }
        return { questionSet: exampleQuestionSet, sessionId: "foo" };
      },
      submitAnswers: (request: IdentityVerificationAnswersRequest) => {
        if (!request.answers.length || request.answers[0] === 3) {
          return { passed: false };
        } else if (request.answers[0] === 2) {
          return setTimeout(() => {
            return { passed: false };
          }, 10000);
        }
        return { passed: true, email: "foo@bar.com", activationToken: "foo" };
      },
    },
  };
});

window.scrollTo = jest.fn();

describe("QuestionsFormContainer", () => {
  let personalDetails: IdentityVerificationRequest;
  const renderWithUser = (
    personalDetails: IdentityVerificationRequest,
    timeToComplete?: number
  ) => ({
    user: userEvent.setup(),
    ...render(
      <QuestionsFormContainer
        personalDetails={personalDetails}
        orgExternalId={personalDetails.orgExternalId}
        timeToComplete={timeToComplete}
      />
    ),
  });

  beforeEach(async () => {
    personalDetails = initPersonalDetails("foo", "Bob", "Bill", "Martínez");
    personalDetails.phoneNumber = "530/867/5309 ext. 222";
  });
  it("show the user that the page is loading", () => {
    personalDetails.orgExternalId = "slow";
    renderWithUser(personalDetails, undefined);
    waitForVerificationDetailSubmission();
  });
  it("should normalize the phone number to getQuestions", () => {
    renderWithUser(personalDetails, undefined);
    waitForVerificationDetailSubmission();
    expect(personalDetails.phoneNumber).toBe("5308675309");
  });
  it("should remove accents from name", () => {
    renderWithUser(personalDetails, undefined);
    waitForVerificationDetailSubmission();
    expect(personalDetails.lastName).toBe("Martinez");
  });
  it("should render the questions form after getQuestions response arrives", async () => {
    renderWithUser(personalDetails, undefined);
    await waitForVerificationDetailSubmission();
    expect(
      screen.getByText(
        "Please select the model year of the vehicle you purchased or leased prior to January 2011",
        { exact: false }
      )
    ).toBeInTheDocument();
  });
  it("shows the success page if submitted with correct responses", async () => {
    const { user } = renderWithUser(personalDetails, undefined);
    await waitForVerificationDetailSubmission();
    await answerIdVerificationQuestions(user);
    const submitButton = screen.queryAllByText("Submit", {
      exact: false,
    })[0];
    await user.click(submitButton);
    expect(
      await screen.findByText(
        "Congratulations, your identity has been verified successfully",
        {
          exact: false,
        }
      )
    ).toBeInTheDocument();
  });
  it("shows the failure page if submitted with incorrect responses", async () => {
    const { user } = renderWithUser(personalDetails, undefined);
    await waitForVerificationDetailSubmission();
    await answerIdVerificationQuestions(user);
    await user.click(screen.getByLabelText("2004", { exact: false }));
    await user.click(
      screen.queryAllByText("Submit", {
        exact: false,
      })[0]
    );
    expect(
      await screen.findByText("We were unable to verify your identity", {
        exact: false,
      })
    ).toBeInTheDocument();
  });
  it("redirects to failure page when countdown runs out", async () => {
    jest.useFakeTimers();
    personalDetails = initPersonalDetails("foo", "Bob", "Bill", "Martínez");
    personalDetails.phoneNumber = "530/867/5309 ext. 222";
    renderWithUser(personalDetails, 1);
    expect(await screen.findByText("0:01")).toBeInTheDocument();
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(
      await screen.findByText("We were unable to verify your identity", {
        exact: false,
      })
    ).toBeInTheDocument();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });
});

const waitForVerificationDetailSubmission = async () => {
  expect(await screen.findByText(/Submitting ID verification details/i));
  await waitFor(() =>
    expect(
      screen.queryByText(/Submitting ID verification details/i)
    ).not.toBeInTheDocument()
  );
};

export const answerIdVerificationQuestions = async (user: UserEvent) => {
  expect(screen.getByLabelText("2002", { exact: false })).toBeInTheDocument();
  await user.click(screen.getByLabelText("2002", { exact: false }));
  await user.click(
    screen.getByLabelText("OPTICIAN / OPTOMETRIST", { exact: false })
  );
  await user.click(
    screen.getByLabelText("MID AMERICA MORTGAGE", { exact: false })
  );
  await user.click(screen.getByLabelText("TWO", { exact: false }));
  await user.click(
    screen.getByLabelText("AGUA DULCE HIGH SCHOOL", { exact: false })
  );
};
