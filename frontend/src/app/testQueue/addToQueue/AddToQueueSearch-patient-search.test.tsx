import React from "react";
import {
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { MemoryRouter } from "react-router-dom";

import AddToQueueSearch, { QUERY_PATIENT } from "./AddToQueueSearch";

let refetchQueueMock;

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

    render(
      <MemoryRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <AddToQueueSearch
            refetchQueue={refetchQueueMock}
            facilityId={facilityId}
            patientsInQueue={[patientInQueue.internalId]}
          />
        </MockedProvider>
      </MemoryRouter>
    );
  });

  describe("patient search", () => {
    it("does not search on too few input search characters", async () => {
      fireEvent.change(screen.getByRole("searchbox", { exact: false }), {
        target: { value: "a" },
      });
      fireEvent.click(screen.getByRole("button"));

      expect(screen.queryByText("Searching...")).not.toBeInTheDocument();
    });

    it("performs search on input change", async () => {
      fireEvent.change(screen.getByRole("searchbox", { exact: false }), {
        target: { value: "bar" },
      });
      fireEvent.click(screen.getByRole("button"));

      expect(screen.getByText("Searching...")).toBeInTheDocument();
      await waitForElementToBeRemoved(() => screen.queryByText("Searching..."));

      expect(screen.queryByText("Searching...")).not.toBeInTheDocument();
      expect(
        await screen.findByText("Cragell, Barb Whitaker")
      ).toBeInTheDocument();
      expect(screen.getByText("Begin test")).toBeInTheDocument();
    });

    it("does not allow adding new test if patient already in queue", async () => {
      fireEvent.change(screen.getByRole("searchbox", { exact: false }), {
        target: { value: "joh" },
      });
      fireEvent.click(screen.getByRole("button"));

      expect(screen.getByText("Searching...")).toBeInTheDocument();
      await waitForElementToBeRemoved(() => screen.queryByText("Searching..."));

      expect(screen.queryByText("Searching...")).not.toBeInTheDocument();
      expect(
        await screen.findByText("Wilhelm, John Jenkins")
      ).toBeInTheDocument();
      expect(screen.getByText("Test in progress")).toBeInTheDocument();
    });
  });
});
