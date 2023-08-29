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
          manageFacilityState={manageFacilityState}
          onClearFilter={handleClearFilter}
          onSelectOrg={handleSelectOrg}
          onSelectFacility={handleSelectFacility}
          onSearch={handleSearch}
          loading={true}
          orgRef={orgRef}
          facilityRef={facilityRef}
        />
      </MemoryRouter>
    );
  };

  it("disables controls when loading data", () => {
    renderWithMocks([], [], initialState);

    const orgSelectionDiv = screen.getByText("Organization");
    const orgDropdown = within(orgSelectionDiv).getByRole("combobox");

    const facilitySelectionDiv = screen.getByText("Testing facility");
    const facilityDropdown = within(facilitySelectionDiv).getByRole("combobox");

    expect(facilityDropdown).toBeDisabled();
    expect(orgDropdown).toBeDisabled();
  });

  it("calls handleClearFilter upon clicking clear filters button", async () => {
    renderWithMocks(mockOrganizationOptions, mockFacilityOptions, {
      facilityId: undefined,
      facility: undefined,
      orgId: "123",
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

    const orgSelectionDiv = screen.getByText("Organization");
    const orgDropdown = within(orgSelectionDiv).getByRole("combobox");

    fireEvent.change(orgDropdown, { target: { value: "123" } });
    await waitFor(() => expect(handleSelectOrg).toHaveBeenCalled());
  });

  it("calls event handlers when facility is selected", async () => {
    renderWithMocks(mockOrganizationOptions, mockFacilityOptions, {
      facilityId: "",
      facility: undefined,
      orgId: "",
    });

    const facilitySelectionDiv = screen.getByText("Testing facility");
    const facilityDropdown = within(facilitySelectionDiv).getByRole("combobox");

    fireEvent.change(facilityDropdown, { target: { value: "123" } });
    await waitFor(() => expect(handleSelectFacility).toHaveBeenCalled());
  });

  it("calls event handlers when search button is clicked", async () => {
    renderWithMocks(mockOrganizationOptions, mockFacilityOptions, {
      facilityId: "123",
      facility: undefined,
      orgId: undefined,
    });

    const searchBtn = screen.getByRole("button", {
      name: /search/i,
    });
    expect(searchBtn).toBeEnabled();
    fireEvent.click(searchBtn);

    await waitFor(() => expect(handleSearch).toHaveBeenCalled());
  });
});
