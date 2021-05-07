import React from "react";
import renderer from "react-test-renderer";
import { render, screen } from "@testing-library/react";

import { Patient } from "../../patients/ManagePatients";
import { TestResult } from "../../testQueue/QueueItem";

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

describe("SearchResults", () => {
  it("should say 'No Results' for no matches", () => {
    const component = renderer.create(
      <SearchResults
        page="queue"
        patients={[]}
        patientsInQueue={[]}
        onAddToQueue={jest.fn()}
        shouldShowSuggestions={true}
        loading={false}
      />
    );

    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should show matching results", () => {
    const component = renderer.create(
      <SearchResults
        page="queue"
        patients={patients}
        patientsInQueue={[]}
        onAddToQueue={jest.fn()}
        shouldShowSuggestions={true}
        loading={false}
      />
    );

    expect(component.toJSON()).toMatchSnapshot();
  });

  it("links the non-duplicate patient", () => {
    const addToQueue = jest.fn();
    render(
      <SearchResults
        page="queue"
        patients={patients}
        patientsInQueue={["a123", "c789"]}
        onAddToQueue={addToQueue}
        shouldShowSuggestions={true}
        loading={false}
      />
    );

    expect(screen.getAllByText("Test in progress")).toHaveLength(2);
    expect(screen.getAllByText("Begin test")).toHaveLength(1);
  });
});
