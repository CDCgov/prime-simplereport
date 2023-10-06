import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import React from "react";
import { ComboBoxRef } from "@trussworks/react-uswds";
import userEvent from "@testing-library/user-event";

import { Option } from "../../commonComponents/Dropdown";

import FacilitySelectFilter from "./FacilitySelectFilter";
import { initialState, ManageFacilityState } from "./ManageFacility";
import {
  getFacilityComboBoxElements,
  getOrgComboBoxElements,
} from "./testSelectUtils";

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
  const orgRef = React.createRef<ComboBoxRef>();
  const facilityRef = React.createRef<ComboBoxRef>();

  const renderWithUser = (
    orgOptions: Option[],
    facilityOptions: Option[],
    manageFacilityState: ManageFacilityState
  ) => ({
    user: userEvent.setup(),
    ...render(
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
    ),
  });

  it("disables controls when loading data", () => {
    renderWithUser([], [], initialState);

    const [orgDropdown] = getOrgComboBoxElements();
    const [facilityDropdown] = getFacilityComboBoxElements();

    expect(facilityDropdown).toBeDisabled();
    expect(orgDropdown).toBeDisabled();
  });

  it("calls handleClearFilter upon clicking clear filters button", async () => {
    const { user } = renderWithUser(
      mockOrganizationOptions,
      mockFacilityOptions,
      {
        orgId: "123",
        facilityId: undefined,
        facility: undefined,
      }
    );
    const clearFiltersBtn = screen.getByRole("button", {
      name: /clear facility selection filters/i,
    });
    expect(clearFiltersBtn).toBeEnabled();
    await user.click(clearFiltersBtn);
    await waitFor(() => expect(handleClearFilter).toHaveBeenCalled());
  });

  it("calls event handlers when organization is selected", async () => {
    const { user } = renderWithUser(
      mockOrganizationOptions,
      mockFacilityOptions,
      initialState
    );

    const [, orgDropdown] = getOrgComboBoxElements();

    await user.selectOptions(orgDropdown, ["organization-123"]);
    await waitFor(() => expect(handleSelectOrg).toHaveBeenCalled());
  });

  it("calls event handlers when facility is selected", async () => {
    const { user } = renderWithUser(
      mockOrganizationOptions,
      mockFacilityOptions,
      {
        orgId: "123",
        facilityId: undefined,
        facility: undefined,
      }
    );

    const [, facilityDropdown] = getFacilityComboBoxElements();
    await user.selectOptions(facilityDropdown, ["facility-123"]);
    await waitFor(() => expect(handleSelectFacility).toHaveBeenCalled());
  });

  it("calls event handlers when search button is clicked", async () => {
    const { user } = renderWithUser(
      mockOrganizationOptions,
      mockFacilityOptions,
      {
        orgId: "123",
        facilityId: "123",
        facility: undefined,
      }
    );

    const searchBtn = screen.getByRole("button", {
      name: /search/i,
    });
    expect(searchBtn).toBeEnabled();
    await user.click(searchBtn);

    await waitFor(() => expect(handleSearch).toHaveBeenCalled());
  });
});
