import { render, screen, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";

import * as srToast from "../../../utils/srToast";
import {
  GetTestResultForResendingEmailsDocument,
  ResendTestResultsEmailDocument,
} from "../../../../generated/graphql";
import { setup } from "../../../utils/jestHelpers";

import EmailTestResultModal, {
  EmailTestResultModalProps,
} from "./EmailTestResultModal";

const mockCloseModal = jest.fn();

jest.mock("react-modal", () => (props: any) => {
  return <div>{props.children}</div>;
});

window.scrollTo = jest.fn();

const getEmailTestResultModalWithMocks = (
  props: EmailTestResultModalProps,
  mocks: any = []
) => (
  <MockedProvider mocks={mocks}>
    <EmailTestResultModal {...props} />
  </MockedProvider>
);

const getTestResultForResendingEmailsMock = {
  request: {
    query: GetTestResultForResendingEmailsDocument,
    variables: { id: "super-fancy-id" },
  },
  result: {
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
  },
};
const resendTestResultsEmailMock = {
  request: {
    query: ResendTestResultsEmailDocument,
    variables: { testEventId: "super-fancy-id" },
  },
  result: {
    data: { sendPatientLinkEmailByTestEventId: true },
  },
};

const resendTestResultsEmailFailureMock = {
  request: {
    query: ResendTestResultsEmailDocument,
    variables: { testEventId: "super-fancy-id" },
  },
  result: {
    data: { sendPatientLinkEmailByTestEventId: false },
  },
};

describe("EmailTestResultModal", () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    alertSpy = jest.spyOn(srToast, "showAlertNotification");
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  it("should show render", async () => {
    const { container } = render(
      getEmailTestResultModalWithMocks(
        {
          isOpen: true,
          testResultId: "super-fancy-id",
          closeModal: mockCloseModal,
        },
        [getTestResultForResendingEmailsMock]
      )
    );

    await screen.findByText("Email result?");
    screen.getByText(
      "Zelda Francesca Holcomb Gordon's test result from November 2nd, 2021 will be sent to the following emails:"
    );
    screen.getByText("gesezyx@mailinator.com");
    screen.getByText("Send result");
    screen.getByText("Cancel");

    expect(container).toMatchSnapshot();
  });

  describe("clicking on Send result button", () => {
    it("should resend the test results email and show success message", async () => {
      const { user } = setup(
        getEmailTestResultModalWithMocks(
          {
            isOpen: true,
            testResultId: "super-fancy-id",
            closeModal: mockCloseModal,
          },
          [getTestResultForResendingEmailsMock, resendTestResultsEmailMock]
        )
      );

      await screen.findByText("Email result?");
      await user.click(screen.getByRole("button", { name: /send result/i }));
      await waitFor(() =>
        expect(alertSpy).toHaveBeenCalledWith(
          "success",
          "Emailed test results."
        )
      );
      expect(mockCloseModal).toHaveBeenCalled();
    });

    it("should show error message when failing to email", async () => {
      const { user } = setup(
        getEmailTestResultModalWithMocks(
          {
            isOpen: true,
            testResultId: "super-fancy-id",
            closeModal: mockCloseModal,
          },
          [
            getTestResultForResendingEmailsMock,
            resendTestResultsEmailFailureMock,
          ]
        )
      );

      await screen.findByText("Email result?");
      await user.click(screen.getByText("Send result"));
      await waitFor(() =>
        expect(alertSpy).toHaveBeenCalledWith(
          "error",
          "Failed to email test results."
        )
      );
      expect(mockCloseModal).toHaveBeenCalled();
    });
  });
});
