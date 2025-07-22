import { MockedProvider, MockedProviderProps } from "@apollo/client/testing";
import * as router from "react-router";
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes, useParams } from "react-router-dom";
import createMockStore from "redux-mock-store";

import { PATIENT_TERM, PATIENT_TERM_CAP } from "../../config/constants";
import { ArchivedStatus } from "../../generated/graphql";

import ManagePatients, {
  patientQuery,
  patientsCountQuery,
} from "./ManagePatients";
import ManagePatientsContainer from "./ManagePatientsContainer";

const PageNumberContainer = () => {
  const { pageNumber } = useParams();
  return (
    <ManagePatients
      currentPage={pageNumber ? +pageNumber : 1}
      activeFacilityId="a1"
      facilityName="Some Facility Name"
      canEditUser={true}
      canDeleteUser={true}
      isOrgAdmin={true}
    />
  );
};

const renderWithUser = () => ({
  user: userEvent.setup(),
  ...render(<TestContainer />),
});

const TestContainer = () => (
  <MockedProvider mocks={mocks}>
    <MemoryRouter initialEntries={["/patients/1"]}>
      <Routes>
        <Route path="/patients">
          <Route path=":pageNumber" element={<PageNumberContainer />} />
        </Route>
      </Routes>
    </MemoryRouter>
  </MockedProvider>
);

describe("ManagePatients", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders a list of patients", async () => {
    renderWithUser();
    expect(await screen.findByText(patients[0].lastName, { exact: false }));
    expect(await screen.findByText(patients[1].lastName, { exact: false }));
    expect(await screen.findByText(patients[2].lastName, { exact: false }));
  });

  it("filters a list of patients", async () => {
    const { user } = renderWithUser();
    expect(await screen.findByText(patients[0].lastName, { exact: false }));
    const input = await screen.findByLabelText(PATIENT_TERM_CAP);
    await user.type(input, "Al");
    await waitForElementToBeRemoved(() =>
      screen.queryByText("Abramcik", { exact: false })
    );
    expect(await screen.findByText(patients[1].lastName, { exact: false }));
    expect(await screen.findByText(patients[2].lastName, { exact: false }));
  });

  it("can go to page 2", async () => {
    const { user } = renderWithUser();
    expect(await screen.findByText(patients[0].lastName, { exact: false }));
    const page2 = screen.getByRole("link", { name: "Page 2" });
    await user.click(page2);
    expect(await screen.findByText(patients[20].lastName, { exact: false }));
  });

  it("standard users can see bulk upload option", async () => {
    const { user } = renderWithUser();
    const addPatientsButton = await screen.findByText("Add patients");
    expect(addPatientsButton).toBeInTheDocument();

    await user.click(addPatientsButton);
    expect(
      await screen.findByText("Import from spreadsheet")
    ).toBeInTheDocument();
  });

  describe("using actions", () => {
    it("archive modal appears on click", async () => {
      const { user } = renderWithUser();
      expect(await screen.findByText(patients[0].lastName, { exact: false }));

      const menu = (await screen.findAllByText("More actions"))[0];
      await user.click(menu);

      await user.click(await screen.findByText(`Archive ${PATIENT_TERM}`));

      expect(await screen.findByText("Yes, I'm sure", { exact: false }));

      await user.click(screen.getByText("No, go back", { exact: false }));
      expect(
        await screen.findByText(patients[0].lastName, { exact: false })
      ).toBeInTheDocument();
    });

    it("when exiting archive modal, the action button is refocused", async () => {
      const { user } = renderWithUser();
      const menu = (await screen.findAllByText("More actions"))[0];
      await user.click(menu);
      await screen.findByText(`Archive ${PATIENT_TERM}`);
      await user.click(screen.getByText(`Archive ${PATIENT_TERM}`));
      await screen.findByText("No, go back");
      await user.click(screen.getByText("No, go back"));

      await waitFor(() =>
        expect(screen.queryByText("No, go back")).not.toBeInTheDocument()
      );

      expect(
        screen.getByTestId(`action_${patients[0].internalId}`, { exact: false })
      ).toHaveFocus();
    });

    it("can start test", async () => {
      const mockNavigate = jest.fn();
      jest.spyOn(router, "useNavigate").mockImplementation(() => mockNavigate);

      const { user } = renderWithUser();
      expect(await screen.findByText(patients[0].lastName, { exact: false }));
      const menu = (await screen.findAllByText("More actions"))[0];
      await user.click(menu);

      const startTestButton = await screen.findByText("Start test");
      expect(startTestButton).toBeInTheDocument();
      await user.click(startTestButton);

      await waitFor(() =>
        expect(mockNavigate).toHaveBeenCalledWith({ search: "?facility=a1" })
      );
    });
  });

  describe("ManagePatientsContainer", () => {
    it("Doesn't render if no facility is selected", async () => {
      render(
        <MockedProvider mocks={mocks}>
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
        </MockedProvider>
      );
      expect(
        await screen.findByText("No facility selected", { exact: false })
      ).toBeInTheDocument();
    });
  });
});

const patients = [
  {
    internalId: "7b968f75-e2fb-43a5-ae8b-c7e0f4873d3a",
    firstName: "Guy",
    lastName: "Abramcik",
    middleName: "Christine Michael",
    birthDate: "1992-11-26",
    isDeleted: false,
    role: "STAFF",
    lastTest: null,
    __typename: "Patient",
  },
  {
    internalId: "47d80532-cc25-4204-829a-6ec7601ad0d9",
    firstName: "Melanie",
    lastName: "Alvarez",
    middleName: "Wade Savage",
    birthDate: "1930-08-01",
    isDeleted: false,
    role: "VISITOR",
    lastTest: null,
    __typename: "Patient",
  },
  {
    internalId: "4a34fdcf-9490-444a-9a20-5ffeb661cb6a",
    firstName: "Byron",
    lastName: "Allan",
    middleName: "Lesley Wells",
    birthDate: "2018-09-05",
    isDeleted: false,
    role: "RESIDENT",
    lastTest: null,
    __typename: "Patient",
  },
  {
    internalId: "8ae24ce5-6d90-4c35-955b-ff61c5869e86",
    firstName: "Katell",
    lastName: "Britt",
    middleName: "Lynn",
    birthDate: "1999-07-22",
    isDeleted: false,
    role: "STUDENT",
    lastTest: {
      dateAdded: "2022-01-28 12:47:20.542",
      __typename: "TestResult",
    },
    __typename: "Patient",
  },
  {
    internalId: "fba92867-e628-44ca-b93b-b181a53543ab",
    firstName: "Colt",
    lastName: "Harper",
    middleName: "Ria Fischer",
    birthDate: "1994-08-02",
    isDeleted: false,
    role: "RESIDENT",
    lastTest: null,
    __typename: "Patient",
  },
  {
    internalId: "28376ab5-31ec-427a-bc87-316932407829",
    firstName: "Rose",
    lastName: "Huffman",
    middleName: "Coby Holden",
    birthDate: "2021-06-27",
    isDeleted: false,
    role: "VISITOR",
    lastTest: null,
    __typename: "Patient",
  },
  {
    internalId: "4012ec09-305f-44f0-b6bb-9d283f72285f",
    firstName: "Hedley",
    lastName: "Johnston",
    middleName: "Jerome Bond",
    birthDate: "1975-02-23",
    isDeleted: false,
    role: "STAFF",
    lastTest: null,
    __typename: "Patient",
  },
  {
    internalId: "b1a0531f-0a85-4ea0-8ede-73f31c06cdc6",
    firstName: "Lois",
    lastName: "Joseph",
    middleName: "Filbert",
    birthDate: "2015-04-03",
    isDeleted: false,
    role: "STUDENT",
    lastTest: { dateAdded: "2022-01-06 13:55:30.12", __typename: "TestResult" },
    __typename: "Patient",
  },
  {
    internalId: "405bd96b-a869-462f-b981-42d6fd76d880",
    firstName: "Aspen",
    lastName: "Joyce",
    middleName: "Harriet Hubbard",
    birthDate: "1962-06-21",
    isDeleted: false,
    role: "RESIDENT",
    lastTest: null,
    __typename: "Patient",
  },
  {
    internalId: "0ff6521e-e44b-4711-a9e9-716902e1c20b",
    firstName: "Venus",
    lastName: "Madden",
    middleName: "Fern",
    birthDate: "1986-12-02",
    isDeleted: false,
    role: "STAFF",
    lastTest: {
      dateAdded: "2022-01-06 13:56:06.306",
      __typename: "TestResult",
    },
    __typename: "Patient",
  },
  {
    internalId: "21acbdde-75d2-40bb-99a6-2c16f165c586",
    firstName: "Dustin",
    lastName: "Malone",
    middleName: "Hadassah Gamble",
    birthDate: "1974-06-30",
    isDeleted: false,
    role: "RESIDENT",
    lastTest: null,
    __typename: "Patient",
  },
  {
    internalId: "adb1f481-f4f7-4659-8554-9ad4c4e6cd25",
    firstName: "Quincy",
    lastName: "McDaniel",
    middleName: null,
    birthDate: "1951-09-28",
    isDeleted: false,
    role: "STAFF",
    lastTest: {
      dateAdded: "2022-01-06 13:56:20.255",
      __typename: "TestResult",
    },
    __typename: "Patient",
  },
  {
    internalId: "28babbe3-396a-42c1-8770-7be971a207f5",
    firstName: "Dahlia",
    lastName: "Meadows",
    middleName: "Hadassah Glass",
    birthDate: "1919-03-10",
    isDeleted: false,
    role: "VISITOR",
    lastTest: null,
    __typename: "Patient",
  },
  {
    internalId: "cd9e2e5a-380b-43e5-a7d4-ff7a4cb2bdfe",
    firstName: "Kieran",
    lastName: "Moran",
    middleName: "Celeste Oneil",
    birthDate: "1963-12-03",
    isDeleted: false,
    role: "STUDENT",
    lastTest: null,
    __typename: "Patient",
  },
  {
    internalId: "b3310d7d-e905-469e-bcff-e95f1487f8fc",
    firstName: "Macon",
    lastName: "Morgan",
    middleName: "Colleen Henson",
    birthDate: "1960-11-26",
    isDeleted: false,
    role: "RESIDENT",
    lastTest: null,
    __typename: "Patient",
  },
  {
    internalId: "9c6e3e70-410c-4b1c-b26d-26f0c8e7b19e",
    firstName: "Gavin",
    lastName: "Nielsen",
    middleName: "Nathaniel Henderson",
    birthDate: "1998-12-21",
    isDeleted: false,
    role: "RESIDENT",
    lastTest: null,
    __typename: "Patient",
  },
  {
    internalId: "5ba9fd42-7d5e-4eb5-ad9c-ba0830f19c8e",
    firstName: "Macon",
    lastName: "Simpson",
    middleName: null,
    birthDate: "1923-03-19",
    isDeleted: false,
    role: "STUDENT",
    lastTest: {
      dateAdded: "2022-01-06 13:56:32.818",
      __typename: "TestResult",
    },
    __typename: "Patient",
  },
  {
    internalId: "117cd268-5ec7-41b4-a595-65ac9925e0a4",
    firstName: "Xerxes",
    lastName: "Vazquez",
    middleName: "Octavius Klein",
    birthDate: "1990-09-23",
    isDeleted: false,
    role: "RESIDENT",
    lastTest: null,
    __typename: "Patient",
  },
  {
    internalId: "acf7e9d8-489d-4b4a-8d06-bd6e246a69e8",
    firstName: "Noelle",
    lastName: "Woodward",
    middleName: "Robin French",
    birthDate: "2011-07-24",
    isDeleted: false,
    role: "RESIDENT",
    lastTest: null,
    __typename: "Patient",
  },
  {
    internalId: "a81a0a08-c125-4c97-b05d-dfd549f18bb7",
    firstName: "Jenna",
    lastName: "Workman",
    middleName: "Cody Myers",
    birthDate: "1976-03-19",
    isDeleted: false,
    role: "STUDENT",
    lastTest: null,
    __typename: "Patient",
  },
  {
    internalId: "7fbd67d5-7ed1-4175-ab9b-f9ec144848b0",
    firstName: "Paki",
    lastName: "Yates",
    middleName: "Bruce Coffey",
    birthDate: "1917-12-29",
    isDeleted: false,
    role: "VISITOR",
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
        archivedStatus: ArchivedStatus.Unarchived,
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
        archivedStatus: ArchivedStatus.Unarchived,
        namePrefixMatch: null,
      },
    },
    result: {
      data: { patients: patients.slice(0, 20) },
    },
  },
  {
    request: {
      query: patientQuery,
      variables: {
        facilityId: "a1",
        pageNumber: 1,
        pageSize: 20,
        archivedStatus: ArchivedStatus.Unarchived,
        namePrefixMatch: null,
      },
    },
    result: {
      data: { patients: patients.slice(20, 21) },
    },
  },
  // Search queries
  {
    request: {
      query: patientsCountQuery,
      variables: {
        facilityId: "a1",
        archivedStatus: ArchivedStatus.Unarchived,
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
        archivedStatus: ArchivedStatus.Unarchived,
        namePrefixMatch: "Al",
      },
    },
    result: {
      data: { patients: patients.slice(1) },
    },
  },
  // landing from closing archive modal
  {
    request: {
      query: patientsCountQuery,
      variables: {
        facilityId: "a1",
        archivedStatus: ArchivedStatus.Unarchived,
        namePrefixMatch: null,
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
        archivedStatus: ArchivedStatus.Unarchived,
        namePrefixMatch: null,
      },
    },
    result: {
      data: { patients: patients.slice(0, 20) },
    },
  },
];
