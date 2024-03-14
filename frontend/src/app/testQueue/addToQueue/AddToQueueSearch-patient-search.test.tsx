import React from "react";
import {
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { MemoryRouter } from "react-router-dom";

import { ArchivedStatus } from "../../../generated/graphql";

import AddToQueueSearch, { QUERY_PATIENT } from "./AddToQueueSearch";

let refetchQueueMock: any;
let setStartTestPatientIdMock: any;

const facilityId = "fake-facility-id";

const patientNotInQueue = {
  internalId: "48c523e8-7c65-4047-955c-e3f65bb8b58a",
  firstName: "Barb",
  middleName: "Whitaker",
  lastName: "Cragell",
  birthDate: "1960-11-07",
  gender: "male",
  lookupId: null,
  __typename: "Patient",
};

const patientInQueue = {
  internalId: "84bc27d1-4d44-4f56-a2a7-964eab299e1c",
  firstName: "John",
  middleName: "Jenkins",
  lastName: "Wilhelm",
  birthDate: "1972-01-21",
  gender: "male",
  lookupId: null,
  __typename: "Patient",
};

const mocks = [
  {
    request: {
      query: QUERY_PATIENT,
      variables: {
        archivedStatus: ArchivedStatus.Unarchived,
        facilityId,
        namePrefixMatch: "bar",
      },
    },
    result: {
      data: {
        patients: [patientNotInQueue],
      },
    },
  },
  {
    request: {
      query: QUERY_PATIENT,
      variables: {
        archivedStatus: ArchivedStatus.Unarchived,
        facilityId,
        namePrefixMatch: "joh",
      },
    },
    result: {
      data: {
        patients: [patientInQueue],
      },
    },
  },
];

describe("AddToSearchQueue", () => {
  beforeEach(async () => {
    refetchQueueMock = jest.fn();
    setStartTestPatientIdMock = jest.fn();
  });

  const renderContainer = () =>
    render(
      <MemoryRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <AddToQueueSearch
            refetchQueue={refetchQueueMock}
            facilityId={facilityId}
            patientsInQueue={[patientInQueue.internalId]}
            startTestPatientId=""
            setStartTestPatientId={setStartTestPatientIdMock}
            canAddPatient={true}
          />
        </MockedProvider>
      </MemoryRouter>
    );

  describe("patient search", () => {
    it("does not search on too few input search characters", async () => {
      renderContainer();
      fireEvent.change(screen.getByRole("searchbox"), {
        target: { value: "a" },
      });

      expect(screen.queryByText("Searching...")).not.toBeInTheDocument();
    });

    it("performs search on input change", async () => {
      renderContainer();
      fireEvent.change(screen.getByRole("searchbox"), {
        target: { value: "bar" },
      });
      await waitForElementToBeRemoved(() => screen.queryByText("Searching..."));

      expect(
        await screen.findByText("Cragell, Barb Whitaker")
      ).toBeInTheDocument();
      expect(screen.getByText("Begin test")).toBeInTheDocument();
    });

    it("does not allow adding new test if patient already in queue", async () => {
      renderContainer();
      fireEvent.change(screen.getByRole("searchbox"), {
        target: { value: "joh" },
      });

      await waitForElementToBeRemoved(() => screen.queryByText("Searching..."));
      expect(
        await screen.findByText("Wilhelm, John Jenkins")
      ).toBeInTheDocument();
      expect(screen.getByText("Test in progress")).toBeInTheDocument();
    });
  });
});
