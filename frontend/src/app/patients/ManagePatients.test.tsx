import { MockedProvider, MockedProviderProps } from "@apollo/client/testing";
import {
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import createMockStore from "redux-mock-store";

import ManagePatients, {
  patientQuery,
  patientsCountQuery,
} from "./ManagePatients";
import ManagePatientsContainer from "./ManagePatientsContainer";

const TestContainer: React.FC = ({ children }) => (
  <MemoryRouter>
    <MockedProvider mocks={mocks}>
      <>{children}</>
    </MockedProvider>
  </MemoryRouter>
);

describe("ManagePatients", () => {
  it("renders a list of patients", async () => {
    render(
      <TestContainer>
        <ManagePatients
          activeFacilityId="a1"
          canEditUser={true}
          canDeleteUser={true}
          isAdmin={false}
        />
      </TestContainer>
    );
    expect(await screen.findByText(patients[0].lastName, { exact: false }));
    expect(await screen.findByText(patients[1].lastName, { exact: false }));
    expect(await screen.findByText(patients[2].lastName, { exact: false }));
  });
  it("filters a list of patients", async () => {
    jest.useFakeTimers();
    render(
      <TestContainer>
        <ManagePatients
          activeFacilityId="a1"
          canEditUser={true}
          canDeleteUser={true}
          isAdmin={false}
        />
      </TestContainer>
    );
    expect(await screen.findByText(patients[0].lastName, { exact: false }));
    const btn = await screen.findByText("Filter", { exact: false });
    fireEvent.click(btn);
    const input = await screen.findByLabelText("Person");
    fireEvent.change(input, { target: { value: "Al" } });
    await waitForElementToBeRemoved(() =>
      screen.queryByText("Abramcik", { exact: false })
    );
    expect(await screen.findByText(patients[1].lastName, { exact: false }));
    expect(await screen.findByText(patients[2].lastName, { exact: false }));
  });
  describe("ManagePatientsContainer", () => {
    it("Doesn't render if no facility is selected", async () => {
      render(
        <MemoryRouter>
          <Provider
            store={createMockStore()({
              facilities: [],
              user: { isAdmin: false },
            })}
          >
            <ManagePatientsContainer />
          </Provider>
        </MemoryRouter>
      );
      expect(
        await screen.findByText("No facility selected", { exact: false })
      ).toBeInTheDocument();
    });
  });
});

const patients = [
  {
    internalId: "5dc030af-2110-4149-bae6-7e8a062d62e3",
    firstName: "Domenic",
    lastName: "Abramcik",
    middleName: "P",
    birthDate: "1960-11-07",
    isDeleted: false,
    role: "RESIDENT",
    lastTest: null,
    __typename: "Patient",
  },
  {
    internalId: "8906b3c6-1168-4683-849e-2728c9573a47",
    firstName: "Emmy",
    lastName: "Alabaster",
    middleName: "O",
    birthDate: "1960-11-07",
    isDeleted: false,
    role: "STUDENT",
    lastTest: null,
    __typename: "Patient",
  },
  {
    internalId: "b905d1e4-67f9-45c8-8822-843ceff09186",
    firstName: "Waite",
    lastName: "Alleway",
    middleName: "Morgen",
    birthDate: "1960-11-07",
    isDeleted: false,
    role: "RESIDENT",
    lastTest: null,
    __typename: "Patient",
  },
];

const mocks: MockedProviderProps["mocks"] = [
  // Initial load queries
  {
    request: {
      query: patientsCountQuery,
      variables: {
        facilityId: "a1",
        showDeleted: false,
        namePrefixMatch: null,
      },
    },
    result: {
      data: {
        patientsCount: patients.length,
      },
    },
  },
  {
    request: {
      query: patientQuery,
      variables: {
        facilityId: "a1",
        pageNumber: 0,
        pageSize: 20,
        showDeleted: false,
        namePrefixMatch: null,
      },
    },
    result: {
      data: { patients },
    },
  },
  // Search queries
  {
    request: {
      query: patientsCountQuery,
      variables: {
        facilityId: "a1",
        showDeleted: false,
        namePrefixMatch: "Al",
      },
    },
    result: {
      data: {
        patientsCount: patients.slice(1).length,
      },
    },
  },
  {
    request: {
      query: patientQuery,
      variables: {
        facilityId: "a1",
        pageNumber: 0,
        pageSize: 20,
        showDeleted: false,
        namePrefixMatch: "Al",
      },
    },
    result: {
      data: { patients: patients.slice(1) },
    },
  },
];
