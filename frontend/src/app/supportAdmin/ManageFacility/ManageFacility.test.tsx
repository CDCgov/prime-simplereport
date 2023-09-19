import { render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import userEvent from "@testing-library/user-event";

import {
  DeleteFacilityDocument,
  GetAllOrganizationsDocument,
  GetFacilitiesByOrgIdDocument,
  GetFacilityStatsDocument,
} from "../../../generated/graphql";

import ManageFacility from "./ManageFacility";
import {
  getFacilityComboBoxElements,
  getOrgComboBoxElements,
} from "./testSelectUtils";

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

  const user = userEvent.setup();

  beforeEach(() => {
    renderWithMocks();
  });

  it("does nothing if no org selection is made", async () => {
    const clearFiltersBtn = getClearFilterBtn();
    expect(clearFiltersBtn).toBeDisabled();

    const [orgComboBoxInput] = getOrgComboBoxElements();
    await waitFor(() => expect(orgComboBoxInput).toBeEnabled());

    expect(clearFiltersBtn).toBeDisabled();
    expect(screen.getByText(/No facility selected/)).toBeInTheDocument();
  });

  it("does nothing if no facility selection is made", async () => {
    const clearFiltersBtn = getClearFilterBtn();
    expect(clearFiltersBtn).toBeDisabled();

    const [orgComboBoxInput, orgComboBoxList] = getOrgComboBoxElements();

    await waitFor(() => expect(orgComboBoxInput).toBeEnabled());
    await user.type(orgComboBoxInput, "dis");
    await user.click(within(orgComboBoxList).getByText("Dis Organization"));

    expect(orgComboBoxInput).toHaveValue("Dis Organization");
    expect(clearFiltersBtn).toBeEnabled();

    await screen.findByText(/No facility selected/);
  });

  it("resets the controls after clicking clear filters", async () => {
    const clearFiltersBtn = getClearFilterBtn();
    expect(clearFiltersBtn).toBeDisabled();

    const [orgComboBoxInput, orgComboBoxList] = getOrgComboBoxElements();
    await waitFor(() => expect(orgComboBoxInput).toBeEnabled());

    await user.type(orgComboBoxInput, "dis");
    await user.click(within(orgComboBoxList).getByText("Dis Organization"));

    await waitFor(() => expect(clearFiltersBtn).toBeEnabled());
    await user.click(clearFiltersBtn);

    await waitFor(() => expect(clearFiltersBtn).toBeDisabled());
    expect(orgComboBoxInput).toHaveValue("");
    expect(screen.getByText(/No facility selected/)).toBeInTheDocument();
  });

  it("loads facility and deletes it", async () => {
    const clearFiltersBtn = getClearFilterBtn();
    expect(clearFiltersBtn).toBeDisabled();

    const [orgComboBoxInput, orgComboBoxList] = getOrgComboBoxElements();
    const [facilityComboBoxInput, facilityComboBoxList] =
      getFacilityComboBoxElements();

    await waitFor(() => expect(orgComboBoxInput).toBeEnabled());
    await user.type(orgComboBoxInput, "dis");
    await user.click(within(orgComboBoxList).getByText("Dis Organization"));

    await waitFor(() => expect(facilityComboBoxInput).toBeEnabled());
    await waitFor(() => expect(clearFiltersBtn).toBeEnabled());
    await user.type(facilityComboBoxInput, "testing site");
    await user.click(within(facilityComboBoxList).getByText("Testing Site"));

    const searchBtn = screen.getByRole("button", {
      name: /search/i,
    });
    await user.click(searchBtn);

    await screen.findByRole("heading", { name: /Testing Site/i });

    const deleteFacilityBtn = screen.getByRole("button", {
      name: /delete facility testing site/i,
    });
    await user.click(deleteFacilityBtn);

    await screen.findByRole("heading", { name: /delete testing site/i });
    const yesDeleteBtn = screen.getByRole("button", {
      name: /yes, delete facility/i,
    });
    await user.click(yesDeleteBtn);

    await waitFor(() =>
      expect(
        screen.queryByRole("heading", { name: /delete testing site/i })
      ).not.toBeInTheDocument()
    );

    // Facility testing site successfully deleted
    // page resets
    await waitFor(() => expect(orgComboBoxInput).toHaveValue(""));
    expect(facilityComboBoxInput).toHaveValue("");
    expect(clearFiltersBtn).toBeDisabled();
  });

  it("loads the page even when no facility is retrieved", async () => {
    const clearFiltersBtn = getClearFilterBtn();
    expect(clearFiltersBtn).toBeDisabled();

    const [orgComboBoxInput, orgComboBoxList] = getOrgComboBoxElements();
    const [facilityComboBoxInput, facilityComboBoxList] =
      getFacilityComboBoxElements();

    await waitFor(() => expect(orgComboBoxInput).toBeEnabled());
    await user.type(orgComboBoxInput, "dat");
    await user.click(within(orgComboBoxList).getByText("Dat Organization"));

    await waitFor(() => expect(facilityComboBoxInput).toBeEnabled());
    expect(clearFiltersBtn).toBeEnabled();
    await user.type(facilityComboBoxInput, "incom");
    await user.click(within(facilityComboBoxList).getByText("Incomplete Site"));

    const searchBtn = screen.getByRole("button", {
      name: /search/i,
    });
    await user.click(searchBtn);

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
