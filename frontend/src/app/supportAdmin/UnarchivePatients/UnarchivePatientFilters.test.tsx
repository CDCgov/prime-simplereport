import React from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Option } from "../../commonComponents/Select";

import { UnarchivePatientState } from "./UnarchivePatient";
import UnarchivePatientFilters from "./UnarchivePatientFilters";
import {
  clickSearch,
  mockFacility1,
  mockFacility2,
  mockOrg1,
  mockOrg2,
  mockPatient1,
  mockPatient2,
  selectDropdown,
} from "./UnarchivePatient.test";

const mockOrgOptions: Option<string>[] = [
  {
    label: mockOrg1.name,
    value: mockOrg1.internalId,
  },
  {
    label: mockOrg2.name,
    value: mockOrg2.internalId,
  },
];
describe("unarchive patient filters", () => {
  let onSelectOrg: jest.Mock;
  let onSelectFacility: jest.Mock;
  let onSearch: jest.Mock;
  let onClearFilter: jest.Mock;

  beforeEach(() => {
    onSelectOrg = jest.fn();
    onSelectFacility = jest.fn();
    onSearch = jest.fn();
    onClearFilter = jest.fn();
  });

  it("displays an error message for empty search fields", async () => {
    let unarchivePatientState: UnarchivePatientState = {
      pageUrl: "/admin/unarchive-patient",
      entriesPerPage: 20,
      orgId: "",
      facilityId: "",
      patientsCount: 2,
      patients: undefined,
      facilities: [mockFacility1, mockFacility2],
    };
    render(
      <UnarchivePatientFilters
        orgOptions={mockOrgOptions}
        onSelectOrg={onSelectOrg}
        onSelectFacility={onSelectFacility}
        onSearch={onSearch}
        onClearFilter={onClearFilter}
        loading={false}
        unarchivePatientState={unarchivePatientState}
      />
    );
    await clickSearch();
    expect(screen.getByText("Organization is required")).toBeInTheDocument();
    expect(
      screen.getByText("Testing facility is required")
    ).toBeInTheDocument();
  });
  it("displays no errors and calls event handlers when search fields are completed", async () => {
    let unarchivePatientState: UnarchivePatientState = {
      pageUrl: "/admin/unarchive-patient",
      entriesPerPage: 20,
      orgId: mockOrg1.internalId,
      facilityId: mockFacility1.id,
      patientsCount: 2,
      patients: [mockPatient1, mockPatient2],
      facilities: [mockFacility1, mockFacility2],
    };
    render(
      <UnarchivePatientFilters
        orgOptions={mockOrgOptions}
        onSelectOrg={onSelectOrg}
        onSelectFacility={onSelectFacility}
        onSearch={onSearch}
        onClearFilter={onClearFilter}
        loading={false}
        unarchivePatientState={unarchivePatientState}
      />
    );
    await selectDropdown("Organization *", mockOrg1.name);
    expect(onSelectOrg).toHaveBeenCalledTimes(1);
    expect(onSelectOrg).toHaveBeenCalledWith(mockOrg1.internalId);
    await selectDropdown("Testing facility *", mockFacility1.name);
    expect(onSelectFacility).toHaveBeenCalledTimes(1);
    expect(onSelectFacility).toHaveBeenCalledWith(mockFacility1.id);
    expect(screen.getByText("Clear filters")).toBeEnabled();
    await clickSearch();
    expect(
      screen.queryByText("Organization is required")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Testing facility is required")
    ).not.toBeInTheDocument();
    expect(onSearch).toHaveBeenCalledTimes(1);
    await act(
      async () => await userEvent.click(screen.getByText("Clear filters"))
    );
    expect(onClearFilter).toHaveBeenCalledTimes(1);
  });
  it("disables select options if patients are loading", async () => {
    let unarchivePatientState: UnarchivePatientState = {
      pageUrl: "/admin/unarchive-patient",
      entriesPerPage: 20,
      orgId: mockOrg1.internalId,
      facilityId: mockFacility1.id,
      patientsCount: 2,
      patients: [mockPatient1, mockPatient2],
      facilities: [mockFacility1, mockFacility2],
    };
    render(
      <UnarchivePatientFilters
        orgOptions={mockOrgOptions}
        onSelectOrg={onSelectOrg}
        onSelectFacility={onSelectFacility}
        onSearch={onSearch}
        onClearFilter={onClearFilter}
        loading={true}
        unarchivePatientState={unarchivePatientState}
      />
    );
    expect(screen.getByLabelText("Organization *")).toBeDisabled();
    expect(screen.getByLabelText("Testing facility *")).toBeDisabled();
    expect(screen.getByText("Search")).toBeDisabled();
  });
});
