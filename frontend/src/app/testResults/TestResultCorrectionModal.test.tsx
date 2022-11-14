import React from "react";
import ReactDOM from "react-dom";
import { MemoryRouter } from "react-router-dom";
import { MockedProvider } from "@apollo/client/testing";
import { Provider } from "react-redux";
import { render, screen, waitFor, within } from "@testing-library/react";
import "./TestResultCorrectionModal.scss";
import userEvent from "@testing-library/user-event";
import configureStore from "redux-mock-store";

import {
  TestCorrectionReasons,
  DetachedTestResultCorrectionModal,
  MARK_TEST_AS_ERROR,
  MARK_TEST_AS_CORRECTION,
  TestCorrectionActions,
  TestCorrectionActionsDescriptions,
  TestCorrectionReason,
} from "./TestResultCorrectionModal";

const internalId = "a665c5d9-ac47-4fd4-8be9-ab7cb5d9f2dd";
const testResult = {
  testResult: {
    dateTested: "2022-01-28T17:56:48.143Z",
    results: [{ disease: { name: "COVID-19" }, testResult: "NEGATIVE" }],
    correctionStatus: null,
    noSymptoms: false,
    symptoms: '{"00000":"false"}',
    symptomOnset: "myOnset",
    pregnancy: null,
    deviceType: {
      name: "Fake device",
    },
    patient: {
      firstName: "First",
      middleName: "Middle",
      lastName: "Last",
      birthDate: "08/07/1990",
    },
    createdBy: {
      name: {
        firstName: "firstName",
        middleName: "middle",
        lastName: "last",
      },
    },
  },
};
const mockFacilityID = "b0d2041f-93c9-4192-b19a-dd99c0044a7e";
const mockStore = configureStore([]);
const store = mockStore({
  facilities: [{ id: mockFacilityID, name: "123" }],
  organization: { name: "Test Organization" },
});

const mockedNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  return {
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockedNavigate,
  };
});

describe("TestResultCorrectionModal", () => {
  let component: any;

  beforeEach(() => {
    ReactDOM.createPortal = jest.fn((element, _node) => {
      return element;
    }) as any;
  });

  it("renders the correction reason dropdown menu", async () => {
    render(
      <Provider store={store}>
        <MockedProvider mocks={[]} addTypename={false}>
          <MemoryRouter>
            <DetachedTestResultCorrectionModal
              data={testResult}
              testResultId={internalId}
              closeModal={() => {}}
            />
          </MemoryRouter>
        </MockedProvider>
      </Provider>
    );

    const expectedCorrectionReasons = Object.values(TestCorrectionReasons);

    const dropdown = await screen.findByLabelText(
      "Please select a reason for correcting this test result."
    );

    for (const correctionReason of expectedCorrectionReasons) {
      expect(
        await within(dropdown).findByText(correctionReason)
      ).toBeInTheDocument();
    }
  });

  it("matches snapshot", () => {
    component = render(
      <Provider store={store}>
        <MockedProvider mocks={[]} addTypename={false}>
          <MemoryRouter>
            <DetachedTestResultCorrectionModal
              data={testResult}
              testResultId={internalId}
              closeModal={() => {}}
            />
          </MemoryRouter>
        </MockedProvider>
      </Provider>
    );

    expect(component).toMatchSnapshot();
  });

  describe("when removing a duplicate test", () => {
    let markAsErrorMockDidComplete = false;
    const mocks = [
      {
        request: {
          query: MARK_TEST_AS_ERROR,
          variables: {
            id: internalId,
            reason: TestCorrectionReason.DUPLICATE_TEST,
          },
        },
        result: () => {
          markAsErrorMockDidComplete = true;

          return {
            data: {
              correctTestMarkAsError: { internalId },
            },
          };
        },
      },
    ];

    beforeEach(() => {
      render(
        <Provider store={store}>
          <MockedProvider mocks={mocks} addTypename={false}>
            <MemoryRouter>
              <DetachedTestResultCorrectionModal
                data={testResult}
                testResultId={internalId}
                closeModal={() => {}}
              />
            </MemoryRouter>
          </MockedProvider>
        </Provider>
      );
    });

    it("sends a GraphQL request to perform the removal", async () => {
      userEvent.click(await screen.findByText("Yes, I'm sure"));

      await waitFor(() => {
        expect(markAsErrorMockDidComplete).toBe(true);
      });
    });
  });

  describe("when correcting for incorrect result", () => {
    let markAsCorrectMockDidComplete = false;
    const mocks = [
      {
        request: {
          query: MARK_TEST_AS_CORRECTION,
          variables: {
            id: internalId,
            reason: TestCorrectionReason.INCORRECT_RESULT,
          },
        },
        result: () => {
          markAsCorrectMockDidComplete = true;

          return {
            data: {
              correctTestMarkAsCorrection: { internalId },
            },
          };
        },
      },
    ];

    beforeEach(() => {
      render(
        <Provider store={store}>
          <MockedProvider mocks={mocks} addTypename={false}>
            <MemoryRouter
              initialEntries={[`/results/1?facility=${mockFacilityID}`]}
            >
              <DetachedTestResultCorrectionModal
                data={testResult}
                testResultId={internalId}
                closeModal={() => {}}
              />
            </MemoryRouter>
          </MockedProvider>
        </Provider>
      );
    });

    it("sends a GraphQL request on submit to initiate correction", async () => {
      const dropdown = await screen.findByLabelText(
        "Please select a reason for correcting this test result."
      );
      userEvent.selectOptions(dropdown, TestCorrectionReasons.INCORRECT_RESULT);

      const submitButton = await screen.findByText("Yes, I'm sure");
      userEvent.click(submitButton);
      await waitFor(() => {
        expect(markAsCorrectMockDidComplete).toBe(true);
      });
      await waitFor(() => {
        expect(mockedNavigate).toHaveBeenCalledWith(
          `/queue?facility=${mockFacilityID}`
        );
      });
    });
  });

  describe("when correcting for a reason not listed", () => {
    let markAsErrorMockDidComplete = false;
    let markAsCorrectionMockDidComplete = false;
    const mocks = [
      {
        request: {
          query: MARK_TEST_AS_ERROR,
          variables: {
            id: internalId,
            reason: "Some good reason",
          },
        },
        result: () => {
          markAsErrorMockDidComplete = true;

          return {
            data: {
              correctTestMarkAsError: { internalId },
            },
          };
        },
      },
      {
        request: {
          query: MARK_TEST_AS_CORRECTION,
          variables: {
            id: internalId,
            reason: "Some good reason",
          },
        },
        result: () => {
          markAsCorrectionMockDidComplete = true;

          return {
            data: {
              correctTestMarkAsCorrection: { internalId },
            },
          };
        },
      },
    ];
    beforeEach(async () => {
      render(
        <Provider store={store}>
          <MockedProvider mocks={mocks} addTypename={false}>
            <MemoryRouter>
              <DetachedTestResultCorrectionModal
                data={testResult}
                testResultId={internalId}
                closeModal={() => {}}
              />
            </MemoryRouter>
          </MockedProvider>
        </Provider>
      );

      const dropdown = await screen.findByLabelText(
        "Please select a reason for correcting this test result."
      );
      userEvent.selectOptions(dropdown, TestCorrectionReasons.OTHER);

      expect(
        await screen.findByText("Additional information", { exact: false })
      ).toBeInTheDocument();
    });

    it("renders sub-form", async () => {
      const additionalDetails = await screen.findByTestId(
        "additionalInformation"
      );
      expect(additionalDetails).toBeInTheDocument();

      const expectedCorrectionActions = Object.values(TestCorrectionActions);
      const expectedCorrectionActionsDescriptions = Object.values(
        TestCorrectionActionsDescriptions
      );

      for (const correctionAction of expectedCorrectionActions) {
        expect(await screen.findByText(correctionAction)).toBeInTheDocument();
      }
      for (const correctionActionDescription of expectedCorrectionActionsDescriptions) {
        expect(
          await screen.findByText(correctionActionDescription)
        ).toBeInTheDocument();
      }
    });

    it("prevents submission if additional details not populated", async () => {
      const correctionActionOption = screen.getByLabelText(
        TestCorrectionActions.CORRECT_RESULT
      );
      userEvent.click(correctionActionOption);

      const submitButton = await screen.findByText("Yes, I'm sure");
      expect(submitButton).toBeDisabled();
    });

    it("prevents submission if additional details does not meet minimum character requirement", async () => {
      const additionalDetails = await screen.findByTestId(
        "additionalInformation"
      );
      userEvent.type(additionalDetails, "no");

      const correctionActionOption = screen.getByLabelText(
        TestCorrectionActions.CORRECT_RESULT
      );
      userEvent.click(correctionActionOption);

      const submitButton = await screen.findByText("Yes, I'm sure");
      expect(submitButton).toBeDisabled();
    });

    it("prevents submission if correction action not selected", async () => {
      const additionalDetails = await screen.findByTestId(
        "additionalInformation"
      );
      userEvent.type(additionalDetails, "Some good reason");

      const submitButton = await screen.findByText("Yes, I'm sure");
      expect(submitButton).toBeDisabled();
    });

    describe("correction actions", () => {
      it("mark as error sends GraphQL request to remove test", async () => {
        const additionalDetails = await screen.findByTestId(
          "additionalInformation"
        );
        userEvent.type(additionalDetails, "Some good reason");
        const correctionActionOption = screen.getByLabelText(
          TestCorrectionActions.MARK_AS_ERROR,
          { exact: false }
        );
        userEvent.click(correctionActionOption);

        const submitButton = await screen.findByText("Yes, I'm sure");
        userEvent.click(submitButton);
        await waitFor(() => {
          expect(markAsErrorMockDidComplete).toBe(true);
        });
      });

      it("mark as incorrect results sends GraphQL request to correct test", async () => {
        const additionalDetails = await screen.findByTestId(
          "additionalInformation"
        );
        userEvent.type(additionalDetails, "Some good reason");

        const correctionActionOption = screen.getAllByLabelText(
          TestCorrectionActions.CORRECT_RESULT,
          { exact: false }
        )[0];

        userEvent.click(correctionActionOption);
        const submitButton = await screen.findByText("Yes, I'm sure");
        userEvent.click(submitButton);
        await waitFor(() => expect(markAsCorrectionMockDidComplete).toBe(true));
      });
    });
  });
});
