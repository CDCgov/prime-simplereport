import React from "react";
import {
  act,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MockedProvider, MockedProviderProps } from "@apollo/client/testing";
import createMockStore from "redux-mock-store";
import { GraphQLError } from "graphql/error";
import { MemoryRouter } from "react-router-dom";
import { configureAxe, toHaveNoViolations } from "jest-axe";

import {
  ArchivedStatus,
  GetOrganizationsDocument,
  GetOrganizationWithFacilitiesDocument,
  GetPatientsByFacilityWithOrgDocument,
  GetPatientsCountByFacilityWithOrgDocument,
} from "../../../generated/graphql";
import * as srToast from "../../utils/srToast";

import UnarchivePatient, {
  UnarchivePatientFacility,
  UnarchivePatientOrganization,
  UnarchivePatientPatient,
} from "./UnarchivePatient";

export const mockFacility1: UnarchivePatientFacility = {
  id: "bc0536e-4564-4291-bbf3-0e7b0731f9e8",
  name: "Mars Facility",
};
export const mockFacility2: UnarchivePatientFacility = {
  id: "d70bb3b3-96bd-40d1-a3ce-b266a7edb91d",
  name: "Jupiter Facility",
};
export const mockPatient1: UnarchivePatientPatient = {
  birthDate: "1927-05-19",
  firstName: "Rod",
  internalId: "60b79a6b-5547-4d54-9cdd-e99ffef59bfc",
  isDeleted: true,
  lastName: "Gutmann",
  middleName: "",
  facility: null,
};
export const mockPatient2: UnarchivePatientPatient = {
  birthDate: "1973-11-20",
  firstName: "Mia",
  internalId: "b0612367-1c82-46ad-88db-2985ac6b81ab",
  isDeleted: true,
  lastName: "Mode",
  middleName: "",
  facility: mockFacility1,
};
export const mockOrg1: UnarchivePatientOrganization = {
  internalId: "f34183c4-b4c5-449f-98b0-2e02abb7aae0",
  externalId: "DC-Space-Camp-f34183c4-b4c5-449f-98b0-2e02abb7aae0",
  name: "Space Org",
  facilities: [mockFacility1, mockFacility2],
};
export const mockOrg2: UnarchivePatientOrganization = {
  internalId: "h3781038-b4c5-449f-98b0-2e02abb7aae0",
  externalId: "DC-Universe-Org-h3781038-b4c5-449f-98b0-2e02abb7aae0",
  name: "Universe Org",
  facilities: [],
};

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

const mockNavigate = jest.fn();
const mockLocation = jest.fn();
expect.extend(toHaveNoViolations);

jest.mock("react-router-dom", () => {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});
let mocks: MockedProviderProps["mocks"];
describe("Unarchive patient", () => {
  const mockStore = createMockStore([]);
  const mockedStore = mockStore({ facilities: [] });
  it("displays search and instructions", async () => {
    mocks = [
      {
        request: {
          query: GetOrganizationsDocument,
          variables: {
            identityVerified: true,
          },
        },
        result: {
          data: {
            organizations: [mockOrg2, mockOrg1],
          },
        },
      },
      {
        request: {
          query: GetOrganizationWithFacilitiesDocument,
          variables: {
            id: mockOrg2.internalId,
          },
        },
        result: {
          data: {
            organization: mockOrg2,
          },
        },
      },
    ];

    render(
      <Provider store={mockedStore}>
        <MockedProvider mocks={mocks} addTypename={false}>
          <UnarchivePatient />
        </MockedProvider>
      </Provider>
    );
    await waitForElementToBeRemoved(() =>
      screen.queryByText("Loading Organizations …")
    );
    expect(screen.getByText("Unarchive patient")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Filter by organization and testing facility to display archived patients."
      )
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Organization *")).toBeInTheDocument();
    expect(screen.getByLabelText("Testing facility *")).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeEnabled();
    expect(await axe(document.body)).toHaveNoViolations();
    // selecting an org with no facilities
    await selectDropdown("Organization *", mockOrg2.name);
    await waitFor(() =>
      expect(screen.getByText("Clear filters")).toBeEnabled()
    );
    expect(
      screen.getByText(
        "This organization has no facilities. Select a different organization."
      )
    ).toBeInTheDocument();
  });
  it("shows an error", async () => {
    let alertSpy = jest.spyOn(srToast, "showError");
    mocks = [
      {
        request: {
          query: GetOrganizationsDocument,
          variables: {
            identityVerified: true,
          },
        },
        result: {
          errors: [
            new GraphQLError(
              "A wild error appeared",
              null,
              null,
              null,
              null,
              null,
              { code: "ERROR_CODE" }
            ),
          ],
        },
      },
    ];
    render(
      <Provider store={mockedStore}>
        <MockedProvider mocks={mocks} addTypename={false}>
          <UnarchivePatient />
        </MockedProvider>
      </Provider>
    );
    await waitForElementToBeRemoved(() =>
      screen.queryByText("Loading Organizations …")
    );
    expect(alertSpy).toHaveBeenCalledWith(
      "A wild error appeared",
      "Something went wrong"
    );
  });
  it("displays patients table on valid search", async () => {
    mocks = [
      {
        request: {
          query: GetOrganizationsDocument,
          variables: {
            identityVerified: true,
          },
        },
        result: {
          data: {
            organizations: [mockOrg2, mockOrg1],
          },
        },
      },
      {
        request: {
          query: GetOrganizationWithFacilitiesDocument,
          variables: {
            id: mockOrg1.internalId,
          },
        },
        result: {
          data: {
            organization: mockOrg1,
          },
        },
      },
      {
        request: {
          query: GetPatientsByFacilityWithOrgDocument,
          variables: {
            facilityId: mockFacility1.id,
            pageNumber: 0,
            pageSize: 20,
            archivedStatus: ArchivedStatus.Archived,
            orgExternalId: mockOrg1.externalId,
          },
        },
        result: {
          data: {
            patients: [mockPatient1, mockPatient2],
          },
        },
      },
      {
        request: {
          query: GetPatientsCountByFacilityWithOrgDocument,
          variables: {
            facilityId: mockFacility1.id,
            archivedStatus: ArchivedStatus.Archived,
            orgExternalId: mockOrg1.externalId,
          },
        },
        result: {
          data: {
            patientsCount: 2,
          },
        },
      },
    ];

    render(
      <Provider store={mockedStore}>
        <MockedProvider mocks={mocks} addTypename={false}>
          <MemoryRouter>
            <UnarchivePatient />
          </MemoryRouter>
        </MockedProvider>
      </Provider>
    );
    await waitForElementToBeRemoved(() =>
      screen.queryByText("Loading Organizations …")
    );
    await expect(screen.getByText("Clear filters")).toBeDisabled();
    await selectDropdown("Organization *", mockOrg1.name);
    await waitFor(async () =>
      expect(screen.getByLabelText("Testing facility *")).toHaveTextContent(
        "Mars Facility"
      )
    );
    await selectDropdown("Testing facility *", mockFacility1.name);
    await clickSearch();
    await waitForElementToBeRemoved(() => screen.queryAllByText("Loading..."));
    checkPatientResultRows();
    expect(await axe(document.body)).toHaveNoViolations();
    await act(
      async () => await userEvent.click(screen.getByText("Clear filters"))
    );
    expect(screen.getByLabelText("Testing facility *")).toHaveDisplayValue(
      "- Select -"
    );
    expect(screen.getByLabelText("Organization *")).toHaveDisplayValue(
      "- Select -"
    );
    expect(
      screen.getByText(
        "Filter by organization and testing facility to display archived patients."
      )
    ).toBeInTheDocument();
    // show form errors
    await clickSearch();
    expect(screen.getByText("Organization is required")).toBeInTheDocument();
    expect(
      screen.getByText("Testing facility is required")
    ).toBeInTheDocument();
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
export const clickSearch = async () => {
  await act(async () => await userEvent.click(screen.getByText("Search")));
};

export const selectDropdown = async (label: string, value: string) => {
  await act(
    async () =>
      await userEvent.selectOptions(screen.getByLabelText(label), value)
  );
};

export const checkPatientResultRows = () => {
  let resultsRow = screen.getAllByTestId("sr-archived-patient-row");
  resultsRow.forEach((row, index) => {
    if (index === 0) {
      expect(within(row).getByText("Gutmann, Rod")).toBeInTheDocument();
      expect(within(row).getByText("05/19/1927")).toBeInTheDocument();
      expect(within(row).getByText("All facilities")).toBeInTheDocument();
    } else if (index === 1) {
      expect(within(row).getByText("Mode, Mia")).toBeInTheDocument();
      expect(within(row).getByText("11/20/1973")).toBeInTheDocument();
      expect(within(row).getByText("Mars Facility")).toBeInTheDocument();
    }
  });
};
