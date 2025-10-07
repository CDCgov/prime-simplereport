import React from "react";
import ReactDOM from "react-dom";
import { MemoryRouter } from "react-router-dom";
import { MockedProvider } from "@apollo/client/testing";
import { Provider } from "react-redux";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import "./TestResultCorrectionModal.scss";
import userEvent from "@testing-library/user-event";
import configureStore from "redux-mock-store";
import { MockedResponse } from "@apollo/client/testing/core";

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
const renderModal = (
  isFacilityDeleted: boolean,
  mocks: ReadonlyArray<MockedResponse>,
  initialEntries?: any[] | undefined
) => {
  render(
    <Provider store={store}>
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter initialEntries={initialEntries}>
          <DetachedTestResultCorrectionModal
            data={testResult}
            testResultId={internalId}
            closeModal={() => {}}
            isFacilityDeleted={isFacilityDeleted}
          />
        </MemoryRouter>
      </MockedProvider>
    </Provider>
  );
};

describe("TestResultCorrectionModal", () => {
  let component: any;

  beforeEach(() => {
    ReactDOM.createPortal = jest.fn((element, _node) => {
      return element;
    }) as any;
  });

  it("renders the correction reason dropdown menu", async () => {
    renderModal(false, []);

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
              isFacilityDeleted={false}
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
      markAsErrorMockDidComplete = false;
    });
    it.each([true, false])(
      "sends a GraphQL request to perform the removal",
      async (isFacilityDeleted) => {
        renderModal(isFacilityDeleted, mocks);
        await act(
          async () =>
            await userEvent.click(await screen.findByText("Yes, I'm sure"))
        );

        await waitFor(() => {
          expect(markAsErrorMockDidComplete).toBe(true);
        });
      }
    );
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
      markAsCorrectMockDidComplete = false;
    });

    it("sends a GraphQL request on submit to initiate correction", async () => {
      renderModal(false, mocks, [`/results/1?facility=${mockFacilityID}`]);
      const dropdown = await screen.findByLabelText(
        "Please select a reason for correcting this test result."
      );
      await act(
        async () =>
          await userEvent.selectOptions(
            dropdown,
            TestCorrectionReasons.INCORRECT_RESULT
          )
      );

      const submitButton = await screen.findByText("Yes, I'm sure");
      await act(async () => await userEvent.click(submitButton));
      await waitFor(() => {
        expect(markAsCorrectMockDidComplete).toBe(true);
      });
      await waitFor(() => {
        expect(mockedNavigate).toHaveBeenCalledWith(
          `/queue?facility=${mockFacilityID}`
        );
      });
    });
    it("prevents submission when facility is deleted", async () => {
      renderModal(true, mocks, [`/results/1?facility=${mockFacilityID}`]);
      const dropdown = await screen.findByLabelText(
        "Please select a reason for correcting this test result."
      );
      await act(
        async () =>
          await userEvent.selectOptions(
            dropdown,
            TestCorrectionReasons.INCORRECT_RESULT
          )
      );

      expect(await screen.findByText("Yes, I'm sure")).toBeDisabled();
      expect(
        screen.getByText("Can't update test result for deleted facility")
      ).toBeInTheDocument();
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
    const selectOther = async () => {
      const dropdown = await screen.findByLabelText(
        "Please select a reason for correcting this test result."
      );
      await act(
        async () =>
          await userEvent.selectOptions(dropdown, TestCorrectionReasons.OTHER)
      );

      expect(
        await screen.findByText("Additional information", { exact: false })
      ).toBeInTheDocument();
    };
    beforeEach(async () => {
      markAsErrorMockDidComplete = false;
      markAsCorrectionMockDidComplete = false;
    });

    it("renders sub-form", async () => {
      renderModal(false, mocks);
      await selectOther();
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
      renderModal(false, mocks);
      await selectOther();
      const correctionActionOption = screen.getByLabelText(
        TestCorrectionActions.CORRECT_RESULT
      );
      await act(async () => await userEvent.click(correctionActionOption));

      const submitButton = await screen.findByText("Yes, I'm sure");
      expect(submitButton).toBeDisabled();
    });

    it("prevents submission if additional details does not meet minimum character requirement", async () => {
      renderModal(false, mocks);
      await selectOther();
      const additionalDetails = await screen.findByTestId(
        "additionalInformation"
      );
      await act(async () => await userEvent.type(additionalDetails, "no"));

      const correctionActionOption = screen.getByLabelText(
        TestCorrectionActions.CORRECT_RESULT
      );
      await act(async () => await userEvent.click(correctionActionOption));

      const submitButton = await screen.findByText("Yes, I'm sure");
      expect(submitButton).toBeDisabled();
    });

    it("prevents submission if correction action not selected", async () => {
      renderModal(false, mocks);
      await selectOther();
      const additionalDetails = await screen.findByTestId(
        "additionalInformation"
      );
      await act(
        async () => await userEvent.type(additionalDetails, "Some good reason")
      );

      const submitButton = await screen.findByText("Yes, I'm sure");
      expect(submitButton).toBeDisabled();
    });

    describe("correction actions", () => {
      it.each([true, false])(
        "mark as error sends GraphQL request to remove test",
        async (isFacilityDeleted) => {
          renderModal(isFacilityDeleted, mocks);
          await selectOther();
          const additionalDetails = await screen.findByTestId(
            "additionalInformation"
          );
          await act(
            async () =>
              await userEvent.type(additionalDetails, "Some good reason")
          );
          const correctionActionOption = screen.getByLabelText(
            TestCorrectionActions.MARK_AS_ERROR,
            { exact: false }
          );
          await act(async () => await userEvent.click(correctionActionOption));

          const submitButton = await screen.findByText("Yes, I'm sure");
          await act(async () => await userEvent.click(submitButton));
          await waitFor(() => {
            expect(markAsErrorMockDidComplete).toBe(true);
          });
        }
      );

      it("mark as incorrect results sends GraphQL request to correct test", async () => {
        renderModal(false, mocks);
        await selectOther();
        const additionalDetails = await screen.findByTestId(
          "additionalInformation"
        );
        await act(
          async () =>
            await userEvent.type(additionalDetails, "Some good reason")
        );

        const correctionActionOption = screen.getAllByLabelText(
          TestCorrectionActions.CORRECT_RESULT,
          { exact: false }
        )[0];

        await act(async () => await userEvent.click(correctionActionOption));
        const submitButton = await screen.findByText("Yes, I'm sure");
        await act(async () => await userEvent.click(submitButton));
        await waitFor(() => expect(markAsCorrectionMockDidComplete).toBe(true));
      });

      it("mark as incorrect results is blocked when facility is deleted", async () => {
        renderModal(true, mocks);
        await selectOther();
        const additionalDetails = await screen.findByTestId(
          "additionalInformation"
        );
        await act(
          async () =>
            await userEvent.type(additionalDetails, "Some good reason")
        );

        const correctionActionOption = screen.getAllByLabelText(
          TestCorrectionActions.CORRECT_RESULT,
          { exact: false }
        )[0];

        await act(async () => await userEvent.click(correctionActionOption));
        expect(await screen.findByText("Yes, I'm sure")).toBeDisabled();
        expect(
          screen.getByText("Can't update test result for deleted facility")
        ).toBeInTheDocument();
      });
    });
  });

  describe("when correcting for incorrect test date", () => {
    let markAsCorrectMockDidComplete = false;
    const mocks = [
      {
        request: {
          query: MARK_TEST_AS_CORRECTION,
          variables: {
            id: internalId,
            reason: TestCorrectionReason.INCORRECT_TEST_DATE,
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
      markAsCorrectMockDidComplete = false;
    });
    it("sends a GraphQL request to edit results", async () => {
      renderModal(false, mocks);
      const dropdown = await screen.findByLabelText(
        "Please select a reason for correcting this test result."
      );
      await act(
        async () =>
          await userEvent.selectOptions(
            dropdown,
            TestCorrectionReasons.INCORRECT_TEST_DATE
          )
      );
      const submitButton = await screen.findByText("Yes, I'm sure");
      await act(async () => await userEvent.click(submitButton));
      await waitFor(() => {
        expect(markAsCorrectMockDidComplete).toBe(true);
      });
    });
    it("should block submission for incorrect test date when facility is deleted", async () => {
      renderModal(true, mocks);
      const dropdown = await screen.findByLabelText(
        "Please select a reason for correcting this test result."
      );
      await act(
        async () =>
          await userEvent.selectOptions(
            dropdown,
            TestCorrectionReasons.INCORRECT_TEST_DATE
          )
      );

      expect(await screen.findByText("Yes, I'm sure")).toBeDisabled();
      expect(
        screen.getByText("Can't update test date for deleted facility")
      ).toBeInTheDocument();
    });
  });
});
