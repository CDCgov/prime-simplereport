import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import { exampleQuestionSet } from "./constants";
import QuestionsFormContainer from "./QuestionsFormContainer";
import { initPersonalDetails } from "./utils";

jest.mock("../SignUpApi", () => {
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
  beforeEach(async () => {
    personalDetails = initPersonalDetails("foo", "Bob", "Bill", "Martínez");
    personalDetails.phoneNumber = "530/867/5309 ext. 222";
    render(
      <QuestionsFormContainer
        personalDetails={personalDetails}
        orgExternalId="foo"
      />
    );
    expect(await screen.findByText(/Submitting ID verification details/i));
    await waitFor(() =>
      expect(
        screen.queryByText(/Submitting ID verification details/i)
      ).not.toBeInTheDocument()
    );
  });
  it("show the user that the page is loading", () => {
    personalDetails.orgExternalId = "slow";
    render(
      <QuestionsFormContainer
        personalDetails={personalDetails}
        orgExternalId="slow"
      />
    );
    expect(
      screen.getByText("Submitting ID verification details", { exact: false })
    ).toBeInTheDocument();
  });
  it("should normalize the phone number to getQuestions", () => {
    expect(personalDetails.phoneNumber).toBe("5308675309");
  });
  it("should remove accents from name", () => {
    expect(personalDetails.lastName).toBe("Martinez");
  });
  it("should render the questions form after getQuestions response arrives", () => {
    expect(
      screen.getByText(
        "Please select the model year of the vehicle you purchased or leased prior to January 2011",
        { exact: false }
      )
    ).toBeInTheDocument();
  });
  describe("Completed form", () => {
    beforeEach(() => {
      expect(
        screen.getByLabelText("2002", { exact: false })
      ).toBeInTheDocument();
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
      it("shows the success page if submitted with correct responses", async () => {
        const submitButton = screen.queryAllByText("Submit", {
          exact: false,
        })[0];
        fireEvent.click(submitButton);
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
        fireEvent.click(screen.getByLabelText("2004", { exact: false }), {
          target: { value: "3" },
        });
        fireEvent.click(
          screen.queryAllByText("Submit", {
            exact: false,
          })[0]
        );
        expect(
          await screen.findByText(
            "Experian was unable to verify your identity",
            {
              exact: false,
            }
          )
        ).toBeInTheDocument();
      });
    });
  });
});

describe("QuestionsFormContainer countdown", () => {
  let personalDetails: IdentityVerificationRequest;
  beforeEach(() => {
    jest.useFakeTimers();
  });

  it("redirects to failure page when countdown runs out", async () => {
    personalDetails = initPersonalDetails("foo", "Bob", "Bill", "Martínez");
    personalDetails.phoneNumber = "530/867/5309 ext. 222";
    render(
      <QuestionsFormContainer
        personalDetails={personalDetails}
        orgExternalId="foo"
        timeToComplete={1}
      />
    );
    expect(await screen.findByText("0:01")).toBeInTheDocument();
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(
      await screen.findByText("Experian was unable to verify your identity.", {
        exact: false,
      })
    ).toBeInTheDocument();
  });
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });
});
