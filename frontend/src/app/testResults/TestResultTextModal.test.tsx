import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing";
import { act } from "react-dom/test-utils";

import * as utils from "../utils";

import TestResultTextModal, {
  DetachedTestResultTextModal,
  SEND_SMS,
  testQuery,
} from "./TestResultTextModal";

const mockCloseModal = jest.fn();

window.scrollTo = jest.fn();

jest.mock("react-modal", () => (props: any) => {
  return <div>{props.children}</div>;
});

describe("TestResultTextModal", () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    alertSpy = jest.spyOn(utils, "showAlertNotification");
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  it("should show render", () => {
    render(
      <MockedProvider mocks={[]}>
        <DetachedTestResultTextModal
          data={{
            testResult: {
              dateTested: "2021-11-02T14:39:15.472Z",

              patient: {
                firstName: "Zelda",
                middleName: "Francesca Holcomb",
                lastName: "Gordon",
                email: "gesezyx@mailinator.com",
                __typename: "Patient",
                phoneNumbers: [
                  {
                    type: "MOBILE",
                    number: "(555) 555-5555",
                    __typename: "PhoneNumber",
                  },
                ],
              },
              patientLink: {
                internalId: "e4c1c27f-768e-44d2-b9d5-e047454c1d24",
                __typename: "PatientLink",
              },
              __typename: "TestResult",
            },
          }}
          testResultId={"super-fancy-id"}
          closeModal={mockCloseModal}
        />
      </MockedProvider>
    );

    screen.getByText("Text result?");
    screen.getByText(
      "Zelda Francesca Holcomb Gordon test result from November 2nd, 2021 will be sent to the following numbers:"
    );
    screen.getByText("(555) 555-5555");
    screen.getByText("Send result");
    screen.getByText("Cancel");
  });

  describe("clicking on Send result button", () => {
    let sendSmsMutationCalled = false;

    let mocks = [
      {
        request: {
          query: testQuery,
          variables: {
            id: "super-fancy-id",
          },
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
                birthDate: "1990/01/01",
                __typename: "Patient",
                phoneNumbers: [
                  {
                    type: "MOBILE",
                    number: "(555) 555-5555",
                    __typename: "PhoneNumber",
                  },
                ],
              },
              patientLink: {
                internalId: "e4c1c27f-768e-44d2-b9d5-e047454c1d24",
                __typename: "PatientLink",
              },
              __typename: "TestResult",
            },
          },
        },
      },
      {
        request: {
          query: SEND_SMS,
          variables: {
            id: "e4c1c27f-768e-44d2-b9d5-e047454c1d24",
          },
        },
        result: () => {
          sendSmsMutationCalled = true;

          return {
            data: {
              sendPatientLinkSms: true,
            },
          };
        },
      },
    ];

    it("should resend the test results text and show success message", async () => {
      render(
        <MockedProvider mocks={mocks}>
          <TestResultTextModal
            testResultId={"super-fancy-id"}
            closeModal={mockCloseModal}
          />
        </MockedProvider>
      );

      await new Promise((resolve) => setTimeout(resolve, 0));

      act(() => {
        userEvent.click(screen.getByText("Send result"));
      });

      await new Promise((resolve) => setTimeout(resolve, 0));
      // Also implies that the mutation was called with the correct patient link ID
      // as the mock would fail to intercept the request otherwise
      expect(sendSmsMutationCalled).toBe(true);

      expect(alertSpy).toHaveBeenCalledWith("success", "Texted test results.");
      expect(mockCloseModal).toHaveBeenCalled();
    });
  });
});
