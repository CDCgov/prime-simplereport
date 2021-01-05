import React from "react";
import renderer from "react-test-renderer";
import { render, screen } from "@testing-library/react";
import SearchResults from "./SearchResults";

//TODO: TYPES
const patients /* : Partial<Patients> */ = [
  {
    internalId: "a123",
    firstName: "George",
    middleName: "",
    lastName: "Washington",
  },
  {
    internalId: "b456",
    firstName: "Martin",
    middleName: "Luther",
    lastName: "King",
  },
  {
    internalId: "c789",
    firstName: "Barack",
    middleName: "Hussein",
    lastName: "Obama",
  },
];

describe("SearchResults", () => {
  it("should say 'No Results' for no matches", () => {
    const component = renderer.create(
      <SearchResults
        patients={[]}
        patientsInQueue={[]}
        facilityId={"1234-5678"}
        onAddToQueue={jest.fn()}
      />
    );

    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should show matching results", () => {
    const component = renderer.create(
      <SearchResults
        patients={patients}
        patientsInQueue={[]}
        facilityId={"1234-5678"}
        onAddToQueue={jest.fn()}
      />
    );

    expect(component.toJSON()).toMatchSnapshot();
  });

  it("links the non-duplicate patient", () => {
    const addToQueue = jest.fn();
    render(
      <SearchResults
        patients={patients}
        patientsInQueue={["a123", "c789"]}
        facilityId={"1234-5678"}
        onAddToQueue={addToQueue}
      />
    );

    expect(screen.getAllByText("Test in progress")).toHaveLength(2);
    expect(screen.getAllByText("Begin Test")).toHaveLength(1);
  });
});
