import { render, screen } from "@testing-library/react";

import QuestionsFormContainer from "./QuestionsFormContainer";
import { initPersonalDetails } from "./utils";

jest.mock("../SignUpApi", () => ({
  SignUpApi: {
    getQuestions: (request: IdentityVerificationRequest) => {
      return setTimeout(() => {
        return "foo";
      }, 1000);
    },
  },
}));

describe("QuestionsFormContainer", () => {
  beforeEach(() => {
    render(
      <QuestionsFormContainer
        personalDetails={initPersonalDetails("foo")}
        orgExternalId="foo"
      />
    );
  });
  it("show the user that the page is loading", () => {
    expect(
      screen.getByText("Submitting ID verification details", { exact: false })
    ).toBeInTheDocument();
  });
});
