import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import * as utils from "../utils";

import EmailTestResultModal from "./EmailTestResultModal";

const mockCloseModal = jest.fn();
const mockResendTestResultsEmail = jest.fn();
let mockResendSuccessValue = true;

window.scrollTo = jest.fn();

jest.mock("react-modal", () => (props: any) => {
  return <div>{props.children}</div>;
});

jest.mock("../../generated/graphql", () => ({
  useResendTestResultsEmailMutation: () => [
    (options: any) => {
      mockResendTestResultsEmail(options);
      return Promise.resolve({
        data: { sendPatientLinkEmail: mockResendSuccessValue },
      });
    },
  ],
  useGetTestResultForResendingEmailsQuery: () => {
    return {
      data: {
        testResult: {
          dateTested: "2021-11-02T14:39:15.472Z",
          patient: {
            firstName: "Zelda",
            middleName: "Francesca Holcomb",
            lastName: "Gordon",
            email: "gesezyx@mailinator.com",
            emails: ["gesezyx@mailinator.com"],
            __typename: "Patient",
          },
          patientLink: {
            internalId: "e4c1c27f-768e-44d2-b9d5-e047454c1d24",
            __typename: "PatientLink",
          },
          __typename: "TestResult",
        },
      },
    };
  },
}));

describe("EmailTestResultModal", () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    alertSpy = jest.spyOn(utils, "showAlertNotification");
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  it("should show render", () => {
    render(
      <EmailTestResultModal
        testResultId={"super-fancy-id"}
        closeModal={mockCloseModal}
      />
    );

    screen.getByText("Email result?");
    screen.getByText(
      "Zelda Francesca Holcomb Gordon's test result from November 2nd, 2021 will be sent to the following emails:"
    );
    screen.getByText("gesezyx@mailinator.com");
    screen.getByText("Send result");
    screen.getByText("Cancel");
  });

  describe("clicking on Send result button", () => {
    it("should resend the test results email and show success message", async () => {
      render(
        <EmailTestResultModal
          testResultId={"super-fancy-id"}
          closeModal={mockCloseModal}
        />
      );

      userEvent.click(screen.getByText("Send result"));

      expect(mockResendTestResultsEmail).toHaveBeenCalledWith({
        variables: { patientLinkId: "e4c1c27f-768e-44d2-b9d5-e047454c1d24" },
      });

      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(alertSpy).toHaveBeenCalledWith("success", "Emailed test results.");
      expect(mockCloseModal).toHaveBeenCalled();
    });

    it("should show error message when failing to email", async () => {
      mockResendSuccessValue = false;
      render(
        <EmailTestResultModal
          testResultId={"super-fancy-id"}
          closeModal={mockCloseModal}
        />
      );

      userEvent.click(screen.getByText("Send result"));

      expect(mockResendTestResultsEmail).toHaveBeenCalledWith({
        variables: { patientLinkId: "e4c1c27f-768e-44d2-b9d5-e047454c1d24" },
      });

      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(alertSpy).toHaveBeenCalledWith(
        "error",
        "Failed to email test results."
      );
      expect(mockCloseModal).toHaveBeenCalled();
    });
  });
});
