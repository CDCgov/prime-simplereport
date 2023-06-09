import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing";
import { MemoryRouter } from "react-router-dom";

import { AoEAnswersDelivery } from "../AoEForm/AoEForm";
import { Patient } from "../../patients/ManagePatients";
import { getAppInsights } from "../../TelemetryService";
import * as srToast from "../../utils/srToast";

import AddToQueueSearch, {
  ADD_PATIENT_TO_QUEUE,
  QUERY_PATIENT,
  QUERY_SINGLE_PATIENT,
} from "./AddToQueueSearch";
import { QueueProps } from "./SearchResults";

let refetchQueueMock;
let setStartTestPatientIdMock;

jest.mock("../../TelemetryService", () => ({
  getAppInsights: jest.fn(),
}));

const facilityId = "fake-facility-id";
const dummyTest = {
  dateAdded: "2020-01-01",
  result: "NEGATIVE" as TestResult,
  dateTested: "2020-01-01",
  deviceTypeModel: "MegaTester2000",
  deviceTypeName: "BinaxNOW",
  facilityName: "Fake Facility",
};

const mockPatient: Patient = {
  internalId: "48c523e8-7c65-4047-955c-e3f65bb8b58a",
  firstName: "Barb",
  middleName: "Whitaker",
  lastName: "Cragell",
  birthDate: "1960-11-07",
  isDeleted: false,
  role: "somerole",
  lastTest: dummyTest,
};

const mockAoeAnswers: AoEAnswersDelivery = {
  noSymptoms: true,
  symptoms: '{"something":"true"}',
  symptomOnset: "2021-06-14",
  pregnancy: "77386006",
  testResultDelivery: "SMS",
};

const patientNotInQueue = {
  internalId: "48c523e8-7c65-4047-955c-e3f65bb8b58a",
  firstName: "Barb",
  middleName: "Whitaker",
  lastName: "Cragell",
  birthDate: "1960-11-07",
  gender: "male",
  lookupId: null,
  telephone: "800 232-4636",
  testResultDelivery: "SMS",
  __typename: "Patient",
};

let queryPatientMockIsDone = false;
let addPatientMockIsDone = false;

const mockFetchGraphQLResult = jest.fn(() => {
  queryPatientMockIsDone = true;
  return {
    data: {
      patient: [patientNotInQueue],
    },
  };
});

const mockGraphQLResult = jest.fn(() => {
  addPatientMockIsDone = true;
  return {
    data: {
      addPatientToQueue: mockPatient.internalId,
    },
  };
});

const mocks = [
  {
    request: {
      query: QUERY_SINGLE_PATIENT,
      variables: {
        internalId: "abc123",
      },
    },
    result: mockFetchGraphQLResult(),
  },
  {
    request: {
      query: QUERY_PATIENT,
      variables: {
        facilityId,
        namePrefixMatch: "bar",
      },
    },
    result: mockFetchGraphQLResult(),
  },
  {
    request: {
      query: ADD_PATIENT_TO_QUEUE,
      variables: {
        patientId: mockPatient.internalId,
        facilityId,
        ...mockAoeAnswers,
      },
    },
    result: mockGraphQLResult(),
  },
];

jest.mock("./SearchResults", () => {
  return (sr: QueueProps) => {
    return (
      <button
        type="submit"
        onClick={() => sr.onAddToQueue(mockPatient, mockAoeAnswers, "create")}
      >
        Begin test (mock button)
      </button>
    );
  };
});

describe("AddToSearchQueue - add to queue", () => {
  const trackEventMock = jest.fn();

  beforeEach(async () => {
    refetchQueueMock = jest.fn();
    setStartTestPatientIdMock = jest.fn();

    (getAppInsights as jest.Mock).mockImplementation(() => ({
      trackEvent: trackEventMock,
    }));

    render(
      <MemoryRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <AddToQueueSearch
            refetchQueue={refetchQueueMock}
            facilityId={facilityId}
            patientsInQueue={[]}
            startTestPatientId="abc123"
            setStartTestPatientId={setStartTestPatientIdMock}
            canAddPatient={true}
          />
        </MockedProvider>
      </MemoryRouter>
    );
  });

  afterEach(() => {
    (getAppInsights as jest.Mock).mockReset();
  });

  it("adds patient to queue from search form", async () => {
    let alertSpy: jest.SpyInstance = jest.spyOn(
      srToast,
      "showAlertNotification"
    );

    await act(
      async () => await userEvent.type(screen.getByRole("searchbox"), "bar")
    );
    await act(
      async () =>
        await userEvent.click(
          screen.getByRole("button", { name: /begin test \(mock button\)/i })
        )
    );

    expect(queryPatientMockIsDone).toBe(true);
    expect(addPatientMockIsDone).toBe(true);
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "success",
        "Cragell, Barb Whitaker was added to the queue",
        "Newly added patients go to the bottom of the queue"
      );
    });
  });

  it("tracks custom telemetry event", async () => {
    await act(
      async () => await userEvent.type(screen.getByRole("searchbox"), "bar")
    );
    await act(
      async () =>
        await userEvent.click(
          screen.getByRole("button", { name: /begin test \(mock button\)/i })
        )
    );

    expect(trackEventMock).toBeCalledWith({ name: "Add Patient To Queue" });
  });
});
