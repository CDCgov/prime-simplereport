import React from "react";
import {
  act,
  render,
  screen,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MockedProvider, MockedProviderProps } from "@apollo/client/testing";
import createMockStore from "redux-mock-store";
import { MemoryRouter } from "react-router-dom";

import {
  ArchivedStatus,
  GetOrganizationWithFacilitiesDocument,
  GetPatientsByFacilityWithOrgDocument,
  GetPatientsCountByFacilityWithOrgDocument,
} from "../../../generated/graphql";

import {
  UnarchivePatientOrganization,
  UnarchivePatientFacility,
  UnarchivePatientPatient,
} from "./UnarchivePatientContainer";
import UnarchivePatient from "./UnarchivePatient";
import { selectDropdown } from "./UnarchivePatientContainer.test";

const mockFacility1: UnarchivePatientFacility = {
  id: "bc0536e-4564-4291-bbf3-0e7b0731f9e8",
  name: "Mars Facility",
};
const mockFacility2: UnarchivePatientFacility = {
  id: "d70bb3b3-96bd-40d1-a3ce-b266a7edb91d",
  name: "Jupiter Facility",
};
const mockPatient1: UnarchivePatientPatient = {
  birthDate: "1927-05-19",
  firstName: "Rod",
  internalId: "60b79a6b-5547-4d54-9cdd-e99ffef59bfc",
  isDeleted: true,
  lastName: "Gutmann",
  middleName: "",
  facility: null,
};
const mockPatient2: UnarchivePatientPatient = {
  birthDate: "1973-11-20",
  firstName: "Mia",
  internalId: "b0612367-1c82-46ad-88db-2985ac6b81ab",
  isDeleted: true,
  lastName: "Mode",
  middleName: "",
  facility: mockFacility1,
};
const mockOrg1: UnarchivePatientOrganization = {
  internalId: "f34183c4-b4c5-449f-98b0-2e02abb7aae0",
  externalId: "DC-Space-Camp-f34183c4-b4c5-449f-98b0-2e02abb7aae0",
  name: "Space Org",
  facilities: [mockFacility1, mockFacility2],
};
const mockOrgs = [mockOrg1];

const mockNavigate = jest.fn();
const mockLocation = jest.fn();

jest.mock("react-router-dom", () => {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});
const mocks: MockedProviderProps["mocks"] = [
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
        archivedStatus: ArchivedStatus.Archived,
        facilityId: mockFacility1.id,
        orgExternalId: mockOrg1.externalId,
        pageNumber: 0,
        pageSize: 20,
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
      query: GetPatientsByFacilityWithOrgDocument,
      variables: {
        archivedStatus: ArchivedStatus.Archived,
        facilityId: mockFacility1.id,
        orgExternalId: mockOrg1.externalId,
        pageNumber: 0,
        pageSize: 20,
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
      query: GetPatientsByFacilityWithOrgDocument,
      variables: {
        archivedStatus: ArchivedStatus.Archived,
        facilityId: mockFacility2.id,
        orgExternalId: mockOrg1.externalId,
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        patients: [],
      },
    },
  },
  {
    request: {
      query: GetPatientsByFacilityWithOrgDocument,
      variables: {
        archivedStatus: ArchivedStatus.Archived,
        facilityId: mockFacility2.id,
        orgExternalId: mockOrg1.externalId,
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        patients: [],
      },
    },
  },
  {
    request: {
      query: GetPatientsCountByFacilityWithOrgDocument,
      variables: {
        archivedStatus: ArchivedStatus.Archived,
        facilityId: mockFacility1.id,
        orgExternalId: mockOrg1.externalId,
      },
    },
    result: {
      data: {
        patientsCount: 2,
      },
    },
  },
  {
    request: {
      query: GetPatientsCountByFacilityWithOrgDocument,
      variables: {
        archivedStatus: ArchivedStatus.Archived,
        facilityId: mockFacility2.id,
        orgExternalId: mockOrg1.externalId,
      },
    },
    result: {
      data: {
        patientsCount: 0,
      },
    },
  },
];

describe("unarchive patient", () => {
  const mockStore = createMockStore([]);
  const mockedStore = mockStore({ facilities: [] });
  let setSelectedOrgId: jest.Mock;
  let setSelectedFacilityId: jest.Mock;
  let setFacilities: jest.Mock;
  let setArchivedPatientsCount: jest.Mock;
  let setArchivedPatients: jest.Mock;

  beforeEach(() => {
    setSelectedOrgId = jest.fn();
    setSelectedFacilityId = jest.fn();
    setFacilities = jest.fn();
    setArchivedPatientsCount = jest.fn();
    setArchivedPatients = jest.fn();
  });
  it("validates search form", async () => {
    let mocks = [
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
    ];
    render(
      <Provider store={mockedStore}>
        <MockedProvider mocks={mocks} addTypename={false}>
          <UnarchivePatient
            organizations={mockOrgs}
            currentPage={1}
            selectedFacilityId={""}
            setSelectedFacilityId={setSelectedFacilityId}
            selectedOrgId={""}
            setSelectedOrgId={setSelectedOrgId}
            archivedPatientsCount={undefined}
            setArchivedPatientsCount={setArchivedPatientsCount}
            facilities={[mockFacility1, mockFacility2]}
            setFacilities={setFacilities}
            archivedPatients={undefined}
            setArchivedPatients={setArchivedPatients}
          />
        </MockedProvider>
      </Provider>
    );
    await clickSearch();
    expect(screen.getByText("Organization is required")).toBeInTheDocument();
    expect(
      screen.getByText("Testing facility is required")
    ).toBeInTheDocument();
    await selectDropdown("Organization *", mockOrg1.name);
    expect(setArchivedPatients).toHaveBeenCalledTimes(1);
    expect(setArchivedPatients).toHaveBeenCalledWith(undefined);
    expect(setArchivedPatientsCount).toHaveBeenCalledTimes(1);
    expect(setArchivedPatientsCount).toHaveBeenCalledWith(undefined);
    expect(
      screen.queryByText("Organization is required")
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("Testing facility is required")
    ).toBeInTheDocument();
    await selectDropdown("Testing facility *", mockFacility1.name);
    expect(
      screen.queryByText("Testing facility is required")
    ).not.toBeInTheDocument();
    // selecting a default option clears
    await selectDropdown("Testing facility *", "Select a testing facility");
    expect(setArchivedPatients).toHaveBeenNthCalledWith(2, undefined);
    expect(setArchivedPatientsCount).toHaveBeenNthCalledWith(2, undefined);
    expect(
      screen.getByText(
        "Filter by organization and testing facility to display archived patients."
      )
    ).toBeInTheDocument();
  });
  it("displays archived patients with pagination", async () => {
    const { container } = render(
      <Provider store={mockedStore}>
        <MockedProvider mocks={mocks} addTypename={false}>
          <MemoryRouter>
            <UnarchivePatient
              organizations={mockOrgs}
              currentPage={1}
              selectedFacilityId={mockFacility1.id}
              setSelectedFacilityId={setSelectedFacilityId}
              selectedOrgId={mockOrg1.internalId}
              setSelectedOrgId={setSelectedOrgId}
              archivedPatientsCount={2}
              setArchivedPatientsCount={setArchivedPatientsCount}
              facilities={[mockFacility1, mockFacility2]}
              setFacilities={setFacilities}
              archivedPatients={[mockPatient1, mockPatient2]}
              setArchivedPatients={setArchivedPatients}
            />
          </MemoryRouter>
        </MockedProvider>
      </Provider>
    );
    await selectDropdown("Organization *", mockOrg1.name);
    expect(setArchivedPatients).toHaveBeenCalledWith(undefined);
    expect(setArchivedPatientsCount).toHaveBeenCalledWith(undefined);
    await selectDropdown("Testing facility *", mockFacility1.name);
    await clickSearch();
    await waitForElementToBeRemoved(() => screen.queryByText("Loading..."));
    expect(setArchivedPatients).toHaveBeenLastCalledWith(
      expect.arrayContaining([mockPatient1, mockPatient2])
    );
    expect(setArchivedPatientsCount).toHaveBeenLastCalledWith(2);
    checkTableHeadersExist();
    expect(
      screen.getByText("Showing 1-2 of 2", { exact: false })
    ).toBeInTheDocument();
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
    expect(container).toMatchSnapshot();
  });
  it("displays no results", async () => {
    render(
      <Provider store={mockedStore}>
        <MockedProvider mocks={mocks} addTypename={false}>
          <MemoryRouter>
            <UnarchivePatient
              organizations={mockOrgs}
              currentPage={1}
              selectedFacilityId={mockFacility2.id}
              setSelectedFacilityId={setSelectedFacilityId}
              selectedOrgId={mockOrg1.internalId}
              setSelectedOrgId={setSelectedOrgId}
              archivedPatientsCount={0}
              setArchivedPatientsCount={setArchivedPatientsCount}
              facilities={[mockFacility1, mockFacility2]}
              setFacilities={setFacilities}
              archivedPatients={[]}
              setArchivedPatients={setArchivedPatients}
            />
          </MemoryRouter>
        </MockedProvider>
      </Provider>
    );
    await selectDropdown("Organization *", mockOrg1.name);
    await selectDropdown("Testing facility *", mockFacility2.name);
    await act(async () => await userEvent.click(screen.getByText("Search")));
    await waitForElementToBeRemoved(() => screen.queryByText("Loading..."));
    checkTableHeadersExist();
    expect(screen.getByText("No results")).toBeInTheDocument();
    expect(
      screen.queryByText("Showing", { exact: false })
    ).not.toBeInTheDocument();
    expect(setArchivedPatients).toHaveBeenLastCalledWith(
      expect.arrayContaining([])
    );
    expect(setArchivedPatientsCount).toHaveBeenLastCalledWith(0);
  });
});
const clickSearch = async () => {
  await act(async () => await userEvent.click(screen.getByText("Search")));
};
const checkTableHeadersExist = () => {
  expect(screen.getByText("Patient")).toBeInTheDocument();
  expect(screen.getByText("Date of birth")).toBeInTheDocument();
  expect(screen.getByText("Action")).toBeInTheDocument();
};
