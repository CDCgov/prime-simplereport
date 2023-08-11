import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";

import {
  DeleteFacilityDocument,
  GetAllOrganizationsDocument,
  GetFacilitiesByOrgIdDocument,
  GetFacilityStatsDocument,
} from "../../../generated/graphql";

import ManageFacility from "./ManageFacility";

describe("ManageFacility", () => {
  const renderWithMocks = () =>
    render(
      <MockedProvider mocks={mocks}>
        <MemoryRouter>
          <ManageFacility />
        </MemoryRouter>
      </MockedProvider>
    );

  const getClearFilterBtn = () =>
    screen.getByRole("button", {
      name: /clear facility selection filters/i,
    });

  beforeEach(() => {
    renderWithMocks();
  });

  it("does nothing if no org selection is made", async () => {
    const clearFiltersBtn = getClearFilterBtn();
    expect(clearFiltersBtn).toBeDisabled();

    const orgDropdown = screen.getByRole("combobox", { name: /organization/i });
    await waitFor(() => expect(orgDropdown).toBeEnabled());
    fireEvent.change(orgDropdown, { target: { value: "" } }); // picks -Select- option

    expect(clearFiltersBtn).toBeDisabled();
    expect(screen.getByText(/No facility selected/)).toBeInTheDocument();
  });

  it("does nothing if no facility selection is made", async () => {
    const clearFiltersBtn = getClearFilterBtn();
    expect(clearFiltersBtn).toBeDisabled();

    const orgDropdown = screen.getByRole("combobox", { name: /organization/i });
    await waitFor(() => expect(orgDropdown).toBeEnabled());
    fireEvent.change(orgDropdown, {
      target: { value: "604f2e80-b4b7-4fff-806a-2a77973aa08f" },
    }); // picks Dis Organization

    const facilityDropdown = screen.getByRole("combobox", {
      name: /facility/i,
    });
    await waitFor(() => expect(facilityDropdown).toBeEnabled());
    expect(clearFiltersBtn).toBeEnabled();
    fireEvent.change(facilityDropdown, { target: { value: "" } }); // picks -Select-

    await waitFor(() => expect(clearFiltersBtn).toBeEnabled());
    expect(screen.getByText(/No facility selected/)).toBeInTheDocument();
  });

  it("resets the controls after clicking clear filters", async () => {
    const clearFiltersBtn = getClearFilterBtn();
    expect(clearFiltersBtn).toBeDisabled();

    const orgDropdown = screen.getByRole("combobox", { name: /organization/i });
    await waitFor(() => expect(orgDropdown).toBeEnabled());
    fireEvent.change(orgDropdown, {
      target: { value: "604f2e80-b4b7-4fff-806a-2a77973aa08f" },
    }); // picks Dis Organization

    await waitFor(() => expect(clearFiltersBtn).toBeEnabled());
    fireEvent.click(clearFiltersBtn);

    await waitFor(() => expect(clearFiltersBtn).toBeDisabled());
    expect(orgDropdown).toHaveValue("");
    expect(screen.getByText(/No facility selected/)).toBeInTheDocument();
  });

  it("loads facility and deletes it", async () => {
    const clearFiltersBtn = getClearFilterBtn();
    expect(clearFiltersBtn).toBeDisabled();

    const orgDropdown = screen.getByRole("combobox", { name: /organization/i });
    await waitFor(() => expect(orgDropdown).toBeEnabled());
    fireEvent.change(orgDropdown, {
      target: { value: "604f2e80-b4b7-4fff-806a-2a77973aa08f" },
    }); // picks Dis Organization

    const facilityDropdown = screen.getByRole("combobox", {
      name: /facility/i,
    });
    await waitFor(() => expect(facilityDropdown).toBeEnabled());
    expect(clearFiltersBtn).toBeEnabled();
    fireEvent.change(facilityDropdown, {
      target: { value: "1919865a-92eb-4c46-b73b-471b02b131b7" },
    }); // picks testing site

    const searchBtn = screen.getByRole("button", {
      name: /search/i,
    });
    fireEvent.click(searchBtn);

    await screen.findByRole("heading", { name: /Testing Site/i });

    const deleteFacilityBtn = screen.getByRole("button", {
      name: /delete facility testing site/i,
    });
    fireEvent.click(deleteFacilityBtn);

    await screen.findByRole("heading", { name: /delete testing site/i });
    const yesDeleteBtn = screen.getByRole("button", {
      name: /yes, delete facility/i,
    });
    fireEvent.click(yesDeleteBtn);

    await waitFor(() =>
      expect(
        screen.queryByRole("heading", { name: /delete testing site/i })
      ).not.toBeInTheDocument()
    );

    // Facility testing site successfully deleted
    // page resets
    await waitFor(() => expect(orgDropdown).toHaveValue(""));
    expect(facilityDropdown).toHaveValue("");
    expect(clearFiltersBtn).toBeDisabled();
  });

  it("loads the page even when no facility is retrieved", async () => {
    const clearFiltersBtn = getClearFilterBtn();
    expect(clearFiltersBtn).toBeDisabled();

    const orgDropdown = screen.getByRole("combobox", { name: /organization/i });
    await waitFor(() => expect(orgDropdown).toBeEnabled());
    fireEvent.change(orgDropdown, {
      target: { value: "09cdf298-39b3-41b0-92f7-092c2bfe065e" },
    }); // picks Dis Organization

    const facilityDropdown = screen.getByRole("combobox", {
      name: /facility/i,
    });
    await waitFor(() => expect(facilityDropdown).toBeEnabled());
    expect(clearFiltersBtn).toBeEnabled();
    fireEvent.change(facilityDropdown, {
      target: { value: "1919865a-92eb-4c46-b73b-471b02b131b8" },
    }); // picks testing site

    const searchBtn = screen.getByRole("button", {
      name: /search/i,
    });
    fireEvent.click(searchBtn);

    await screen.findByRole("heading", { name: /Incomplete Site/i });
  });
});

const mocks: MockedResponse[] = [
  {
    request: {
      query: GetAllOrganizationsDocument,
    },
    result: {
      data: {
        organizations: [
          {
            id: "604f2e80-b4b7-4fff-806a-2a77973aa08f",
            name: "Dis Organization",
            __typename: "Organization",
          },
          {
            id: "09cdf298-39b3-41b0-92f7-092c2bfe065e",
            name: "Dat Organization",
            __typename: "Organization",
          },
          {
            id: "a096fe1f-1563-4a24-be0d-31340363ec47",
            name: "Unverified Org",
            __typename: "Organization",
          },
          {
            id: "b68c4e11-e96c-400f-8594-b9e8954e4074",
            name: "1691157937-Casper and Sons",
            __typename: "Organization",
          },
        ],
      },
    },
  },
  {
    request: {
      query: GetFacilitiesByOrgIdDocument,
      variables: {
        orgId: "604f2e80-b4b7-4fff-806a-2a77973aa08f",
      },
    },
    result: {
      data: {
        organization: {
          name: "Dis Organization",
          type: "university",
          facilities: [
            {
              name: "Testing Site",
              id: "1919865a-92eb-4c46-b73b-471b02b131b7",
              city: "Los Angeles",
              state: "CA",
              zipCode: "90000",
              __typename: "Facility",
            },
          ],
          __typename: "Organization",
        },
      },
    },
  },
  {
    request: {
      query: GetFacilitiesByOrgIdDocument,
      variables: {
        orgId: "09cdf298-39b3-41b0-92f7-092c2bfe065e",
      },
    },
    result: {
      data: {
        organization: {
          name: null,
          type: undefined,
          facilities: [
            {
              name: "Incomplete Site",
              id: "1919865a-92eb-4c46-b73b-471b02b131b8",
              city: undefined,
              state: null,
              zipCode: undefined,
              __typename: "Facility",
            },
          ],
          __typename: "Organization",
        },
      },
    },
  },
  {
    request: {
      query: GetFacilityStatsDocument,
      variables: {
        facilityId: "1919865a-92eb-4c46-b73b-471b02b131b7",
      },
    },
    result: {
      data: {
        facilityStats: {
          usersSingleAccessCount: 2,
          patientsSingleAccessCount: 1,
          __typename: "FacilityStats",
        },
      },
    },
  },
  {
    request: {
      query: GetFacilityStatsDocument,
      variables: {
        facilityId: "1919865a-92eb-4c46-b73b-471b02b131b8",
      },
    },
    result: {
      data: {
        facilityStats: {
          usersSingleAccessCount: 2,
          patientsSingleAccessCount: 1,
          __typename: "FacilityStats",
        },
      },
    },
  },
  {
    request: {
      query: DeleteFacilityDocument,
      variables: {
        facilityId: "1919865a-92eb-4c46-b73b-471b02b131b7",
      },
    },
    result: {
      data: { markFacilityAsDeleted: "" },
    },
  },
];
