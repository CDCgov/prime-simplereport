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
import { configureAxe } from "jest-axe";
import { v4 as uuidv4 } from "uuid";

import {
  ArchivedStatus,
  GetOrganizationsDocument,
  GetOrganizationWithFacilitiesDocument,
  GetPatientsByFacilityWithOrgDocument,
  GetPatientsCountByFacilityWithOrgDocument,
  UnarchivePatientDocument,
} from "../../../generated/graphql";
import * as srToast from "../../utils/srToast";

import UnarchivePatient from "./UnarchivePatient";
import {
  mockOrg2,
  mockOrg1,
  mockFacility1,
  mockPatient1,
  mockPatient2,
} from "./testUtils";

const createMockPatients = (patientNum: number) => {
  let mockPatients = [];
  while (patientNum > 0) {
    let mockUUID = uuidv4();
    let patient = {
      birthDate: "1973-11-20",
      firstName: `User first ${patientNum}`,
      internalId: mockUUID,
      isDeleted: true,
      lastName: `User first ${patientNum}`,
      middleName: "",
      facility: null,
    };
    mockPatients.push(patient);
    patientNum--;
  }
  return mockPatients;
};

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

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

describe("Unarchive patient", () => {
  const mockStore = createMockStore([]);
  const mockedStore = mockStore({ facilities: [] });

  function renderWithMocks(mocks: MockedProviderProps["mocks"]) {
    render(
      <Provider store={mockedStore}>
        <MockedProvider mocks={mocks} addTypename={false}>
          <MemoryRouter>
            <UnarchivePatient />
          </MemoryRouter>
        </MockedProvider>
      </Provider>
    );
  }

  it("displays search and instructions", async () => {
    renderWithMocks(defaultMocks);

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
    renderWithMocks(errorMocks);

    await waitForElementToBeRemoved(() =>
      screen.queryByText("Loading Organizations …")
    );
    expect(alertSpy).toHaveBeenCalledWith(
      "A wild error appeared",
      "Something went wrong"
    );
  });
  it("displays patients table on valid search", async () => {
    renderWithMocks(mocksWithPatients);

    await waitForElementToBeRemoved(() =>
      screen.queryByText("Loading Organizations …")
    );
    expect(screen.getByText("Clear filters")).toBeDisabled();
    await searchByOrgAndFacility();
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

  it("displays unarchive patient modal and unarchives patient", async () => {
    let alertErrorSpy: jest.SpyInstance;
    let alertSuccessSpy: jest.SpyInstance;
    alertErrorSpy = jest.spyOn(srToast, "showError");
    alertSuccessSpy = jest.spyOn(srToast, "showSuccess");

    const mocks = [...mocksWithPatients, ...additionalMocks];
    renderWithMocks(mocks);

    await waitForElementToBeRemoved(() =>
      screen.queryByText("Loading Organizations …")
    );
    await searchByOrgAndFacility();
    await act(async () => screen.getAllByText("Unarchive")[0].click());
    expect(screen.getByRole("dialog")).toHaveTextContent(
      /Are you sure you want to unarchive Gutmann, Rod\?/
    );
    await act(async () =>
      expect(await axe(document.body)).toHaveNoViolations()
    );
    await act(async () => screen.getByText("Yes, I'm sure").click());
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await waitFor(() => {
      expect(alertErrorSpy).toHaveBeenCalledWith(
        "Please escalate this issue to the SimpleReport team.",
        "Error unarchiving patient"
      );
    });
    checkPatientResultRows();
    await act(async () => screen.getAllByText("Unarchive")[1].click());
    expect(screen.getByRole("dialog")).toHaveTextContent(
      /Are you sure you want to unarchive Mode, Mia\?/
    );
    await act(async () => screen.getByText("Yes, I'm sure").click());
    await waitFor(() => {
      expect(alertSuccessSpy).toHaveBeenCalledWith(
        "",
        "Patient successfully unarchived"
      );
    });

    expect(await axe(document.body)).toHaveNoViolations();
  });

  it("navigates to previous page when archiving last patient on page", async () => {
    renderWithMocks(mocksWithExtraPatients);

    await waitFor(() =>
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument()
    );
    await searchByOrgAndFacility();
    await act(async () => screen.getByText("2").closest("a")?.click());
    await waitFor(() =>
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument()
    );
    await act(async () => screen.getAllByText("Unarchive")[0].click());
    expect(screen.getByRole("dialog")).toHaveTextContent(
      /Are you sure you want to unarchive Gutmann, Rod\?/
    );
    await act(async () => screen.getByText("Yes, I'm sure").click());
    await waitFor(() =>
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument()
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByText("2")).not.toBeInTheDocument();
    expect(screen.queryByText("Next")).not.toBeInTheDocument();
    expect(screen.queryByText("Prev")).not.toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});

const searchByOrgAndFacility = async () => {
  await selectDropdown("Organization *", mockOrg1.name);
  await waitFor(async () =>
    expect(screen.getByLabelText("Testing facility *")).toHaveTextContent(
      "Mars Facility"
    )
  );
  await selectDropdown("Testing facility *", mockFacility1.name);
  await clickSearch();
  expect(mockNavigate).not.toHaveBeenCalled();
  await waitForElementToBeRemoved(() => screen.queryAllByText("Loading..."));
};

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
const defaultMocks = [
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

const mocksWithPatients = [
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

const errorMocks = [
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

const additionalMocks = [
  {
    request: {
      query: UnarchivePatientDocument,
      variables: {
        id: mockPatient1.internalId,
        orgExternalId: mockOrg1.externalId,
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
  {
    request: {
      query: UnarchivePatientDocument,
      variables: {
        id: mockPatient2.internalId,
        orgExternalId: mockOrg1.externalId,
      },
    },
    result: {
      data: {
        setPatientIsDeleted: {
          internalId: mockPatient2.internalId,
        },
      },
    },
  },
];

const mockPatientGroup = createMockPatients(20);

const mocksWithExtraPatients = [
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
        patients: mockPatientGroup,
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
        patientsCount: 21,
      },
    },
  },
  {
    request: {
      query: GetPatientsByFacilityWithOrgDocument,
      variables: {
        facilityId: mockFacility1.id,
        pageNumber: 1,
        pageSize: 20,
        archivedStatus: ArchivedStatus.Archived,
        orgExternalId: mockOrg1.externalId,
      },
    },
    result: {
      data: {
        patients: [mockPatient1],
      },
    },
  },
  {
    request: {
      query: UnarchivePatientDocument,
      variables: {
        id: mockPatient1.internalId,
        orgExternalId: mockOrg1.externalId,
      },
    },
    result: {
      data: {
        setPatientIsDeleted: {
          internalId: mockPatient1.internalId,
        },
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
        patientsCount: 20,
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
        patients: mockPatientGroup,
      },
    },
  },
];
