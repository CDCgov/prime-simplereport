import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import * as srToast from "../utils/srToast";

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
        data: { sendPatientLinkEmailByTestEventId: mockResendSuccessValue },
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
          __typename: "TestResult",
        },
      },
    };
  },
}));

describe("EmailTestResultModal", () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    alertSpy = jest.spyOn(srToast, "showAlertNotification");
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  it("should show render", () => {
    let component: any;
    component = render(
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

    expect(component).toMatchSnapshot();
  });

  describe("clicking on Send result button", () => {
    it("should resend the test results email and show success message", async () => {
      render(
        <EmailTestResultModal
          testResultId={"super-fancy-id"}
          closeModal={mockCloseModal}
        />
      );

      await userEvent.click(screen.getByText("Send result"));

      expect(mockResendTestResultsEmail).toHaveBeenCalledWith({
        variables: { testEventId: "super-fancy-id" },
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

      await userEvent.click(screen.getByText("Send result"));

      expect(mockResendTestResultsEmail).toHaveBeenCalledWith({
        variables: { testEventId: "super-fancy-id" },
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
