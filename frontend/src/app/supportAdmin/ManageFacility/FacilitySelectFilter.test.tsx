import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import React from "react";
import { ComboBoxRef } from "@trussworks/react-uswds";

import { Option } from "../../commonComponents/Dropdown";

import FacilitySelectFilter from "./FacilitySelectFilter";
import { initialState, ManageFacilityState } from "./ManageFacility";

export const getOrgComboBoxElements = () => {
  const orgSelectionDiv = screen.getByTestId("org-selection-container");
  const orgComboBoxInput = screen.getByLabelText("Organization *");
  const orgComboBoxList = within(orgSelectionDiv).getByTestId(
    "combo-box-option-list"
  );
  return [orgComboBoxInput, orgComboBoxList] as const;
};

export const getFacilityComboBoxElements = () => {
  const facilitySelectionDiv = screen.getByTestId(
    "facility-selection-container"
  );
  const facilityComboBoxInput = screen.getByLabelText("Testing facility *");
  const facilityComboBoxList = within(facilitySelectionDiv).getByTestId(
    "combo-box-option-list"
  );
  return [facilityComboBoxInput, facilityComboBoxList] as const;
};
describe("FacilitySelectFilter", () => {
  const handleClearFilter = jest.fn();
  const handleSelectOrg = jest.fn();
  const handleSelectFacility = jest.fn();
  const handleSearch = jest.fn();
  const mockOrganizationOptions: Option[] = [
    { value: "123", label: "organization-123" },
  ];
  const mockFacilityOptions: Option[] = [
    { value: "123", label: "facility-123" },
  ];

  const renderWithMocks = (
    orgOptions: Option[],
    facilityOptions: Option[],
    manageFacilityState: ManageFacilityState
  ) => {
    const orgRef = React.createRef<ComboBoxRef>();
    const facilityRef = React.createRef<ComboBoxRef>();
    render(
      <MemoryRouter>
        <FacilitySelectFilter
          organizationOptions={orgOptions}
          facilityOptions={facilityOptions}
          onClearFilter={handleClearFilter}
          onSelectOrg={handleSelectOrg}
          onSelectFacility={handleSelectFacility}
          onSearch={handleSearch}
          manageFacilityState={manageFacilityState}
          loading={true}
          orgRef={orgRef}
          facilityRef={facilityRef}
        />
      </MemoryRouter>
    );
  };

  it("disables controls when loading data", () => {
    renderWithMocks([], [], initialState);

    const [orgDropdown] = getOrgComboBoxElements();
    const [facilityDropdown] = getFacilityComboBoxElements();

    expect(facilityDropdown).toBeDisabled();
    expect(orgDropdown).toBeDisabled();
  });

  it("calls handleClearFilter upon clicking clear filters button", async () => {
    renderWithMocks(mockOrganizationOptions, mockFacilityOptions, {
      orgId: "123",
      facilityId: undefined,
      facility: undefined,
    });
    const clearFiltersBtn = screen.getByRole("button", {
      name: /clear facility selection filters/i,
    });
    expect(clearFiltersBtn).toBeEnabled();
    fireEvent.click(clearFiltersBtn);
    await waitFor(() => expect(handleClearFilter).toHaveBeenCalled());
  });

  it("calls event handlers when organization is selected", async () => {
    renderWithMocks(mockOrganizationOptions, mockFacilityOptions, initialState);

    const [orgDropdown] = getOrgComboBoxElements();

    fireEvent.change(orgDropdown, { target: { value: "123" } });
    await waitFor(() => expect(handleSelectOrg).toHaveBeenCalled());
  });

  it("calls event handlers when facility is selected", async () => {
    renderWithMocks(mockOrganizationOptions, mockFacilityOptions, {
      orgId: undefined,
      facilityId: undefined,
      facility: undefined,
    });

    const [facilityDropdown] = getFacilityComboBoxElements();
    fireEvent.change(facilityDropdown, { target: { value: "123" } });
    await waitFor(() => expect(handleSelectFacility).toHaveBeenCalled());
  });

  it("calls event handlers when search button is clicked", async () => {
    renderWithMocks(mockOrganizationOptions, mockFacilityOptions, {
      orgId: undefined,
      facilityId: "123",
      facility: undefined,
    });

    const searchBtn = screen.getByRole("button", {
      name: /search/i,
    });
    expect(searchBtn).toBeEnabled();
    fireEvent.click(searchBtn);

    await waitFor(() => expect(handleSearch).toHaveBeenCalled());
  });
});
