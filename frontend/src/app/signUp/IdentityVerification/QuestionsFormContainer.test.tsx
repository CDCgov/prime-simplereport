import { act, fireEvent, render, screen } from "@testing-library/react";

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
        if (request.answers[0] === 2) {
          return setTimeout(() => {
            return { passed: false };
          }, 10000);
        } else if (request.answers[0] === 3) {
          return { passed: false };
        }
        return { passed: true, email: "foo@bar.com", activationToken: "foo" };
      },
    },
  };
});

describe("QuestionsFormContainer", () => {
  beforeEach(async () => {
    await act(async () => {
      render(
        <QuestionsFormContainer
          personalDetails={initPersonalDetails("foo", "Bob", "Bill", "Buckley")}
          orgExternalId="foo"
        />
      );
    });
  });
  it("show the user that the page is loading", () => {
    render(
      <QuestionsFormContainer
        personalDetails={initPersonalDetails("slow", "Bob", "Bill", "Buckley")}
        orgExternalId="slow"
      />
    );
    expect(
      screen.getByText("Submitting ID verification details", { exact: false })
    ).toBeInTheDocument();
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
        await act(async () => {
          await fireEvent.click(
            screen.queryAllByText("Submit", {
              exact: false,
            })[0]
          );
        });
        expect(
          screen.getByText(
            "Congratulations, your identity has been verified successfully",
            {
              exact: false,
            }
          )
        ).toBeInTheDocument();
      });
      it("shows the failure page if submitted with incorrect responses", async () => {
        await fireEvent.click(screen.getByLabelText("2004", { exact: false }), {
          target: { value: "3" },
        });
        await act(async () => {
          await fireEvent.click(
            screen.queryAllByText("Submit", {
              exact: false,
            })[0]
          );
        });
        expect(
          screen.getByText("Experian was unable to verify your identity", {
            exact: false,
          })
        ).toBeInTheDocument();
      });
    });
  });
});
