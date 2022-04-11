import React from "react";
import ReactDOM from "react-dom";
import { MockedProvider } from "@apollo/client/testing";
import { render, screen, within } from "@testing-library/react";

import "./TestResultCorrectionModal.scss";
import { TestResult } from "../testQueue/QueueItem";

import {
  TestCorrectionReasons,
  DetachedTestResultCorrectionModal,
  MARK_TEST_AS_ERROR,
  MARK_TEST_AS_CORRECTION,
} from "./TestResultCorrectionModal";

const internalId = "a665c5d9-ac47-4fd4-8be9-ab7cb5d9f2dd";
const testResult = {
  testResult: {
    dateTested: "2022-01-28T17:56:48.143Z",
    result: "NEGATIVE" as TestResult,
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
describe("TestResultCorrectionModal", () => {
  let component: any;

  beforeEach(() => {
    // TODO: what does this do...?
    ReactDOM.createPortal = jest.fn((element, _node) => {
      return element;
    }) as any;
  });

  afterEach(() => {});

  it("renders the correction reason dropdown menu", async () => {
    component = render(
      <MockedProvider mocks={[]}>
        <DetachedTestResultCorrectionModal
          data={testResult}
          testResultId="id"
          closeModal={() => {}}
        />
      </MockedProvider>
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
      <MockedProvider mocks={[]}>
        <DetachedTestResultCorrectionModal
          data={testResult}
          testResultId="id"
          closeModal={() => {}}
        />
      </MockedProvider>
    );

    expect(component).toMatchSnapshot();
  });

  describe("marks test as error", () => {
    let markAsErrorMockDidComplete: boolean;
    let mocks;

    beforeEach(() => {
      mocks = [
        {
          request: {
            query: MARK_TEST_AS_ERROR,
            variables: {
              id: internalId,
              reason: TestCorrectionReasons.DUPLICATE_TEST,
            },
          },
          result: () => {
            markAsErrorMockDidComplete = true;

            return {
              data: {
                internalId,
              },
            };
          },
        },
      ];

      render(
        <MockedProvider mocks={mocks}>
          <DetachedTestResultCorrectionModal
            data={testResult}
            testResultId="id"
            closeModal={() => {}}
          />
        </MockedProvider>
      );
    });

    describe("when removing a duplicate test", () => {
      it("sends a GraphQL request to perform the removal", () => {
        expect(markAsErrorMockDidComplete).toBe(true);
      });
    });

    /*
    describe("when removing for a reason not listed", () => {
      // snapshot

      it("renders sub-form", () => {
        // snapshot
      });

      it("prevents submission if additional details not populated", () => {
        // snapshot
      });

      it("sends a GraphQL request to perform the removal", () => {

      });
    });
    */
  });

  describe("marks test as correction", () => {
    let markAsCorrectMockDidComplete: boolean;
    let mocks;

    beforeEach(() => {
      mocks = [
        {
          request: {
            query: MARK_TEST_AS_CORRECTION,
            variables: {
              id: internalId,
              reason: TestCorrectionReasons.INCORRECT_RESULT,
            },
          },
          result: () => {
            markAsCorrectMockDidComplete = true;

            return {
              data: {
                internalId,
              },
            };
          },
        },
      ];

      render(
        <MockedProvider mocks={mocks}>
          <DetachedTestResultCorrectionModal
            data={testResult}
            testResultId="id"
            closeModal={() => {}}
          />
        </MockedProvider>
      );
    });
    it("sends a GraphQL request on submit to initiate correction", () => {
      expect(markAsCorrectMockDidComplete).toBe(true);
    });

    /*
    it("redirects to the test queue", () => {
      // might not do this - TBD
    });
    */
  });
});
