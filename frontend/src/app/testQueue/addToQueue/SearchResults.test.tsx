import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Patient } from "../../patients/ManagePatients";
import { TestResult } from "../QueueItem";

import SearchResults from "./SearchResults";

const dummyTest = {
  dateAdded: "2020-01-01",
  result: "NEGATIVE" as TestResult,
  dateTested: "2020-01-01",
  deviceTypeModel: "MegaTester2000",
  deviceTypeName: "BinaxNOW",
  facilityName: "Fake Facility",
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
    <Routes>{children}</Routes>
  </MemoryRouter>
);

jest.mock("react-router-dom", () => {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    Navigate: (props: any) => `Redirected to ${props.to}`,
  };
});

describe("SearchResults", () => {
  describe("No Results", () => {
    it("should say 'No Results' for no matches", () => {
      render(
        <RouterWithFacility>
          <Route
            path="/queue"
            element={
              <SearchResults
                page="queue"
                patients={[]}
                patientsInQueue={[]}
                onAddToQueue={jest.fn()}
                shouldShowSuggestions={true}
                loading={false}
              />
            }
          />
        </RouterWithFacility>
      );

      expect(screen.getByText("No results found.")).toBeInTheDocument();
    });

    it("should show add patient button", () => {
      render(
        <RouterWithFacility>
          <Route
            path="/queue"
            element={
              <SearchResults
                page="queue"
                patients={[]}
                patientsInQueue={[]}
                onAddToQueue={jest.fn()}
                shouldShowSuggestions={true}
                loading={false}
              />
            }
          />
        </RouterWithFacility>
      );

      expect(screen.getByText("Add new patient")).toBeInTheDocument();
      userEvent.click(screen.getByText("Add new patient"));
      expect(
        screen.getByText(
          `Redirected to /add-patient?facility=${mockFacilityID}`
        )
      ).toBeInTheDocument();
    });
  });

  it("should show matching results", () => {
    render(
      <RouterWithFacility>
        <Route
          path="/queue"
          element={
            <SearchResults
              page="queue"
              patients={patients}
              patientsInQueue={[]}
              onAddToQueue={jest.fn()}
              shouldShowSuggestions={true}
              loading={false}
            />
          }
        />
      </RouterWithFacility>
    );

    expect(screen.getByText("Washington, George")).toBeInTheDocument();
  });

  it("links the non-duplicate patient", () => {
    const addToQueue = jest.fn();
    render(
      <RouterWithFacility>
        <Route
          path="/queue"
          element={
            <SearchResults
              page="queue"
              patients={patients}
              patientsInQueue={["a123", "c789"]}
              onAddToQueue={addToQueue}
              shouldShowSuggestions={true}
              loading={false}
            />
          }
        />
      </RouterWithFacility>
    );

    expect(screen.getAllByText("Test in progress")).toHaveLength(2);
    expect(screen.getByText("Begin test")).toBeInTheDocument();
  });

  it("opens a modal for selected patient", async () => {
    const addToQueue = jest.fn();
    render(
      <RouterWithFacility>
        <Route
          path="/queue"
          element={
            <SearchResults
              page="queue"
              patients={[]}
              patientsInQueue={[]}
              onAddToQueue={addToQueue}
              shouldShowSuggestions={true}
              loading={false}
              selectedPatient={patients[0]}
            />
          }
        />
      </RouterWithFacility>
    );

    expect(screen.getByText("Test questionnaire")).toBeInTheDocument();
    expect(screen.getByText("Washington, George")).toBeInTheDocument();
    expect(screen.getByText("Continue")).toBeInTheDocument();
  });
});
