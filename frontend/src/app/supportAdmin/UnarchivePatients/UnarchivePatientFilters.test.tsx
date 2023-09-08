import React from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { ComboBoxRef } from "@trussworks/react-uswds";

import { Option } from "../../commonComponents/Select";
import {
  getFacilityComboBoxElements,
  getOrgComboBoxElements,
} from "../ManageFacility/testSelectUtils";

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
} from "./testUtils";

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

  const renderWithMocks = (
    unarchivePatientState: UnarchivePatientState,
    loading = false
  ) => {
    const orgRef = React.createRef<ComboBoxRef>();
    const facilityRef = React.createRef<ComboBoxRef>();
    render(
      <MemoryRouter>
        <UnarchivePatientFilters
          orgOptions={mockOrgOptions}
          facilityOptions={
            unarchivePatientState.facilities.map((facility) => ({
              value: facility.id,
              label: facility.name,
            })) ?? []
          }
          onSelectOrg={onSelectOrg}
          onSelectFacility={onSelectFacility}
          onSearch={onSearch}
          onClearFilter={onClearFilter}
          loading={loading}
          disableClearFilters={false}
          disableSearch={loading}
          orgRef={orgRef}
          facilityRef={facilityRef}
        />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    onSelectOrg = jest.fn();
    onSelectFacility = jest.fn();
    onSearch = jest.fn();
    onClearFilter = jest.fn();
  });

  const user = userEvent.setup();

  it("displays no errors and calls event handlers when search fields are completed", async () => {
    let unarchivePatientState: UnarchivePatientState = {
      pageUrl: "/admin/unarchive-patient",
      entriesPerPage: 20,
      orgId: mockOrg1.internalId,
      facilityId: mockFacility1.id,
      patientsCount: 2,
      patients: [mockPatient1, mockPatient2],
      facilities: [mockFacility1, mockFacility2],
      patient: undefined,
    };
    renderWithMocks(unarchivePatientState);

    const [, orgComboBoxList] = getOrgComboBoxElements();
    expect(orgComboBoxList).toBeEnabled();

    await act(
      async () => await user.selectOptions(orgComboBoxList, mockOrg1.name)
    );
    // expect(onSelectOrg).toHaveBeenCalledTimes(1); <--- figure on trigger on render issue???
    expect(onSelectOrg).toHaveBeenCalledWith(mockOrg1.internalId);

    const [, facilityComboBoxList] = getFacilityComboBoxElements();
    expect(facilityComboBoxList).toBeEnabled();

    await act(
      async () =>
        await user.selectOptions(facilityComboBoxList, mockFacility1.name)
    );
    expect(onSelectFacility).toHaveBeenCalledWith(mockFacility1.id);

    expect(screen.getByText("Clear filters")).toBeEnabled();
    await clickSearch();

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
      patient: undefined,
    };
    renderWithMocks(unarchivePatientState, true);

    const [orgComboInput] = getOrgComboBoxElements();
    const [facilityComboInput] = getFacilityComboBoxElements();

    expect(orgComboInput).toBeDisabled();
    expect(facilityComboInput).toBeDisabled();
    expect(screen.getByText("Search")).toBeDisabled();
  });
});
