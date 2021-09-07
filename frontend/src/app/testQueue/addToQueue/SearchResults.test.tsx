import React from "react";
import renderer from "react-test-renderer";
import { MemoryRouter } from "react-router";
import { act, render, screen, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import userEvent from "@testing-library/user-event";

import { Patient } from "../../patients/ManagePatients";
import { TestResult } from "../QueueItem";
import { LAST_TEST_QUERY } from "../AoEForm/AoEModalForm";

import SearchResults from "./SearchResults";

const dummyTest = {
  dateAdded: "2020-01-01",
  result: "NEGATIVE" as TestResult,
  dateTested: "2020-01-01",
  deviceTypeModel: "MegaTester2000",
};

const patients: Patient[] = [
  {
    internalId: "a123",
    firstName: "George",
    middleName: "",
    lastName: "Washington",
    birthDate: "1950-01-01",
    isDeleted: false,
    role: "somerole",
    lastTest: dummyTest,
  },
  {
    internalId: "b456",
    firstName: "Martin",
    middleName: "Luther",
    lastName: "King",
    birthDate: "1950-01-01",
    isDeleted: false,
    role: "somerole",
    lastTest: dummyTest,
  },
  {
    internalId: "c789",
    firstName: "Barack",
    middleName: "Hussein",
    lastName: "Obama",
    birthDate: "1950-01-01",
    isDeleted: false,
    role: "somerole",
    lastTest: dummyTest,
  },
];

const mockFacilityID = "facility-id-101";
const RouterWithFacility: React.FC = ({ children }) => (
  <MemoryRouter initialEntries={[`/queue?facility=${mockFacilityID}`]}>
    {children}
  </MemoryRouter>
);

const mocks = [
  {
    request: {
      query: LAST_TEST_QUERY,
      variables: {
        patientId: "a123",
      },
    },
    result: {
      data: {
        patient: {
          lastTest: {
            dateTested: "2021-02-05T22:01:55.386Z",
            result: "NEGATIVE",
          },
        },
      },
    },
  },
];

jest.mock("react-router-dom", () => ({
  Redirect: (props: any) => `Redirected to ${props.to}`,
}));

describe("SearchResults", () => {
  describe("No Results", () => {
    it("should say 'No Results' for no matches", () => {
      const component = renderer.create(
        <RouterWithFacility>
          <SearchResults
            page="queue"
            patients={[]}
            patientsInQueue={[]}
            onAddToQueue={jest.fn()}
            shouldShowSuggestions={true}
            loading={false}
          />
        </RouterWithFacility>
      );

      expect(component.toJSON()).toMatchSnapshot();
    });

    it("should show add patient button", () => {
      render(
        <RouterWithFacility>
          <SearchResults
            page="queue"
            patients={[]}
            patientsInQueue={[]}
            onAddToQueue={jest.fn()}
            shouldShowSuggestions={true}
            loading={false}
          />
        </RouterWithFacility>
      );

      expect(screen.getByText("Add new patient")).toBeInTheDocument();
      act(() => {
        userEvent.click(screen.getByText("Add new patient"));
      });
      expect(
        screen.getByText(
          `Redirected to /add-patient?facility=${mockFacilityID}`
        )
      ).toBeInTheDocument();
    });
  });

  it("should show matching results", () => {
    const component = renderer.create(
      <RouterWithFacility>
        <SearchResults
          page="queue"
          patients={patients}
          patientsInQueue={[]}
          onAddToQueue={jest.fn()}
          shouldShowSuggestions={true}
          loading={false}
        />
      </RouterWithFacility>
    );

    expect(component.toJSON()).toMatchSnapshot();
  });

  it("links the non-duplicate patient", () => {
    const addToQueue = jest.fn();
    render(
      <RouterWithFacility>
        <SearchResults
          page="queue"
          patients={patients}
          patientsInQueue={["a123", "c789"]}
          onAddToQueue={addToQueue}
          shouldShowSuggestions={true}
          loading={false}
        />
      </RouterWithFacility>
    );

    expect(screen.getAllByText("Test in progress")).toHaveLength(2);
    expect(screen.getAllByText("Begin test")).toHaveLength(1);
  });

  it("opens a modal for selected patient", async () => {
    const addToQueue = jest.fn();
    render(
      <RouterWithFacility>
        <MockedProvider mocks={mocks} addTypename={false}>
          <SearchResults
            page="queue"
            patients={[]}
            patientsInQueue={[]}
            onAddToQueue={addToQueue}
            shouldShowSuggestions={true}
            loading={false}
            selectedPatient={patients[0]}
          />
        </MockedProvider>
      </RouterWithFacility>
    );

    await waitFor(() => {
      expect(screen.getByText("Test questionnaire")).toBeInTheDocument();
      expect(screen.getByText("Washington, George")).toBeInTheDocument();
      expect(screen.getByText("Continue")).toBeInTheDocument();
    });
  });
});
