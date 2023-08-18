import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

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
  ) =>
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
        />
      </MemoryRouter>
    );

  it("disables controls when loading data", () => {
    renderWithMocks([], [], initialState);

    expect(
      screen.getByRole("combobox", { name: /organization/i })
    ).toBeDisabled();
    expect(screen.getByRole("combobox", { name: /facility/i })).toBeDisabled();
  });

  it("calls handleClearFilter upon clicking clear filters button", async () => {
    renderWithMocks(mockOrganizationOptions, mockFacilityOptions, {
      orgId: "123",
      facilityId: "",
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
    const orgDropdown = screen.getByRole("combobox", { name: /organization/i });
    fireEvent.change(orgDropdown, { target: { value: "123" } });
    await waitFor(() => expect(handleSelectOrg).toHaveBeenCalled());
  });

  it("calls event handlers when facility is selected", async () => {
    renderWithMocks(mockOrganizationOptions, mockFacilityOptions, {
      orgId: "123",
      facilityId: "",
      facility: undefined,
    });
    const facilityDropdown = screen.getByRole("combobox", {
      name: /facility/i,
    });
    fireEvent.change(facilityDropdown, { target: { value: "123" } });
    await waitFor(() => expect(handleSelectFacility).toHaveBeenCalled());
  });

  it("calls event handlers when search button is clicked", async () => {
    renderWithMocks(mockOrganizationOptions, mockFacilityOptions, {
      orgId: "123",
      facilityId: "123",
      facility: undefined,
    });
    const facilityDropdown = screen.getByRole("combobox", {
      name: /facility/i,
    });
    fireEvent.change(facilityDropdown, { target: { value: "123" } });

    const searchBtn = screen.getByRole("button", {
      name: /search/i,
    });
    fireEvent.click(searchBtn);

    await waitFor(() => expect(handleSearch).toHaveBeenCalled());
  });
});
