import React from "react";
import { render, screen } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { MemoryRouter } from "react-router-dom";

import AddToQueueSearch, {
  QUERY_SINGLE_PATIENT,
  StartTestProps,
} from "./AddToQueueSearch";
import { QueueProps } from "./SearchResults";

const facilityId = "fake-facility-id";

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

const mocks = [
  {
    request: {
      query: QUERY_SINGLE_PATIENT,
      variables: {
        internalId: "48c523e8-7c65-4047-955c-e3f65bb8b58a",
      },
    },
    result: {
      data: {
        patient: patientNotInQueue,
      },
    },
  },
];

jest.mock("./SearchResults", () => {
  return (sr: QueueProps) => {
    return (
      <>
        <p>selectedPatient: {sr.selectedPatient?.internalId}</p>
      </>
    );
  };
});

jest.mock("./SearchInput", () => {
  return () => {
    return (
      <>
        <p>SearchInput</p>
      </>
    );
  };
});

const getRefetchQueue = jest.fn();
const setStartTestPatientIdMock = jest.fn();

describe("AddToSearchQueue - new patient begin test", () => {
  beforeEach(() => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/queue",
            state: {
              patientId: "48c523e8-7c65-4047-955c-e3f65bb8b58a",
            } as StartTestProps,
          },
        ]}
      >
        <MockedProvider mocks={mocks} addTypename={false}>
          <AddToQueueSearch
            refetchQueue={getRefetchQueue}
            facilityId={facilityId}
            patientsInQueue={[]}
            startTestPatientId="48c523e8-7c65-4047-955c-e3f65bb8b58a"
            setStartTestPatientId={setStartTestPatientIdMock}
            canAddPatient={true}
          />
        </MockedProvider>
      </MemoryRouter>
    );
  });

  it("should start test for patient when passed through search params", async () => {
    expect(
      await screen.findByText(
        "selectedPatient: 48c523e8-7c65-4047-955c-e3f65bb8b58a"
      )
    ).toBeInTheDocument();
  });

  afterAll(() => {
    jest.useRealTimers();
  });
});
