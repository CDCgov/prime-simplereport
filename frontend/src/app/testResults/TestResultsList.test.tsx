import qs from "querystring";

import { MockedProvider } from "@apollo/client/testing";
import { render, screen, within } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import configureStore from "redux-mock-store";
import userEvent from "@testing-library/user-event";

import { QUERY_PATIENT } from "../testQueue/addToQueue/AddToQueueSearch";

import { testResultDetailsQuery } from "./TestResultDetailsModal";
import TestResultsList, {
  DetachedTestResultsList,
  resultsCountQuery,
  testResultQuery,
} from "./TestResultsList";

const mockStore = configureStore([]);
const store = mockStore({
  organization: {
    name: "Organization Name",
  },
  user: {
    firstName: "Kim",
    lastName: "Mendoza",
  },
  facilities: [
    { id: "1", name: "Facility 1" },
    { id: "2", name: "Facility 2" },
  ],
  facility: { id: "1", name: "Facility 1" },
});

jest.mock("@microsoft/applicationinsights-react-js", () => ({
  useAppInsightsContext: () => {},
  useTrackEvent: jest.fn(),
}));

const WithRouter: React.FC = ({ children }) => (
  <MemoryRouter initialEntries={[{ search: "?facility=1" }]}>
    {children}
  </MemoryRouter>
);

// Data copied from Chrome network window
const testResults = [
  {
    internalId: "0969da96-b211-41cd-ba61-002181f0918d",
    dateTested: "2021-03-17T19:27:23.806Z",
    result: "NEGATIVE",
    correctionStatus: "ORIGINAL",
    deviceType: {
      internalId: "8c1a8efe-8951-4f84-a4c9-dcea561d7fbb",
      name: "Abbott IDNow",
      __typename: "DeviceType",
    },
    patient: {
      internalId: "48c523e8-7c65-4047-955c-e3f65bb8b58a",
      firstName: "Barb",
      middleName: "Whitaker",
      lastName: "Cragell",
      birthDate: "1960-11-07",
      gender: "male",
      role: "RESIDENT",
      lookupId: null,
      __typename: "Patient",
    },
    createdBy: {
      nameInfo: {
        firstName: "Arthur",
        middleName: "A",
        lastName: "Admin",
      },
    },
    patientLink: {
      internalId: "68c543e8-7c65-4047-955c-e3f65bb8b58a",
    },
    noSymptoms: true,
    symptoms: "{}",
    __typename: "TestResult",
  },
  {
    internalId: "7c768a5d-ef90-44cd-8050-b96dd77f51d5",
    dateTested: "2021-03-18T19:27:21.052Z",
    result: "NEGATIVE",
    correctionStatus: "ORIGINAL",
    deviceType: {
      internalId: "8c1a8efe-8951-4f84-a4c9-dcea561d7fbb",
      name: "Abbott IDNow",
      __typename: "DeviceType",
    },
    patient: {
      internalId: "f74ad245-3a69-44b5-bb6d-efe06308bb85",
      firstName: "Barde",
      middleName: "X",
      lastName: "Colleer",
      birthDate: "1960-11-07",
      gender: "female",
      role: "STAFF",
      lookupId: null,
      __typename: "Patient",
    },
    createdBy: {
      nameInfo: {
        firstName: "Ursula",
        middleName: "",
        lastName: "User",
      },
    },
    patientLink: {
      internalId: "68c543e8-7c65-4047-955c-e3f65bb8b58a",
    },
    noSymptoms: false,
    symptoms: "{}",
    __typename: "TestResult",
  },
  {
    internalId: "7c768a5d-ef90-44cd-8050-b96dd7aaa1d5",
    dateTested: "2021-03-19T19:27:21.052Z",
    result: "POSITIVE",
    correctionStatus: "ORIGINAL",
    deviceType: {
      internalId: "8c1a8efe-8951-4f84-a4c9-dcea561d7fbb",
      name: "Abbott IDNow",
      __typename: "DeviceType",
    },
    patient: {
      internalId: "f74ad245-3a69-44b5-bb6d-efe06308bb85",
      firstName: "Sam",
      middleName: "G",
      lastName: "Gerard",
      birthDate: "1960-11-07",
      gender: "male",
      role: "RESIDENT",
      lookupId: null,
      __typename: "Patient",
    },
    createdBy: {
      nameInfo: {
        firstName: "Ethan",
        middleName: "",
        lastName: "Entry",
      },
    },
    patientLink: {
      internalId: "68c543e8-7c65-4047-955c-e3f65bb8b58a",
    },
    noSymptoms: false,
    symptoms: '{"someSymptom":"true"}',
    __typename: "TestResult",
  },
];

const testResultsByPatient = [
  {
    internalId: "0969da96-b211-41cd-ba61-002181f0918d",
    dateTested: "2021-03-17T19:27:23.806Z",
    result: "NEGATIVE",
    correctionStatus: "ORIGINAL",
    deviceType: {
      internalId: "8c1a8efe-8951-4f84-a4c9-dcea561d7fbb",
      name: "Abbott IDNow",
      __typename: "DeviceType",
    },
    patient: {
      internalId: "48c523e8-7c65-4047-955c-e3f65bb8b58a",
      firstName: "Barb",
      middleName: "Whitaker",
      lastName: "Cragell",
      birthDate: "1960-11-07",
      gender: "male",
      role: "RESIDENT",
      lookupId: null,
      __typename: "Patient",
    },
    createdBy: {
      nameInfo: {
        firstName: "Arthur",
        middleName: "A",
        lastName: "Admin",
      },
    },
    patientLink: {
      internalId: "68c543e8-7c65-4047-955c-e3f65bb8b58a",
    },
    noSymptoms: true,
    symptoms: "{}",
    __typename: "TestResult",
  },
];

const testResultsByResultValue = [
  {
    internalId: "0969da96-b211-41cd-ba61-002181f0918d",
    dateTested: "2021-03-17T19:27:23.806Z",
    result: "NEGATIVE",
    correctionStatus: "ORIGINAL",
    deviceType: {
      internalId: "8c1a8efe-8951-4f84-a4c9-dcea561d7fbb",
      name: "Abbott IDNow",
      __typename: "DeviceType",
    },
    patient: {
      internalId: "48c523e8-7c65-4047-955c-e3f65bb8b58a",
      firstName: "Barb",
      middleName: "Whitaker",
      lastName: "Cragell",
      birthDate: "1960-11-07",
      gender: "male",
      role: "RESIDENT",
      lookupId: null,
      __typename: "Patient",
    },
    createdBy: {
      nameInfo: {
        firstName: "Arthur",
        middleName: "A",
        lastName: "Admin",
      },
    },
    patientLink: {
      internalId: "68c543e8-7c65-4047-955c-e3f65bb8b58a",
    },
    noSymptoms: true,
    symptoms: "{}",
    __typename: "TestResult",
  },
  {
    internalId: "7c768a5d-ef90-44cd-8050-b96dd77f51d5",
    dateTested: "2021-03-18T19:27:21.052Z",
    result: "NEGATIVE",
    correctionStatus: "ORIGINAL",
    deviceType: {
      internalId: "8c1a8efe-8951-4f84-a4c9-dcea561d7fbb",
      name: "Abbott IDNow",
      __typename: "DeviceType",
    },
    patient: {
      internalId: "f74ad245-3a69-44b5-bb6d-efe06308bb85",
      firstName: "Barde",
      middleName: "X",
      lastName: "Colleer",
      birthDate: "1960-11-07",
      gender: "female",
      role: "STAFF",
      lookupId: null,
      __typename: "Patient",
    },
    createdBy: {
      nameInfo: {
        firstName: "Ursula",
        middleName: "",
        lastName: "User",
      },
    },
    patientLink: {
      internalId: "68c543e8-7c65-4047-955c-e3f65bb8b58a",
    },
    noSymptoms: false,
    symptoms: "{}",
    __typename: "TestResult",
  },
];

const testResultsByRole = [
  {
    internalId: "0969da96-b211-41cd-ba61-002181f0918d",
    dateTested: "2021-03-17T19:27:23.806Z",
    result: "NEGATIVE",
    correctionStatus: "ORIGINAL",
    deviceType: {
      internalId: "8c1a8efe-8951-4f84-a4c9-dcea561d7fbb",
      name: "Abbott IDNow",
      __typename: "DeviceType",
    },
    patient: {
      internalId: "48c523e8-7c65-4047-955c-e3f65bb8b58a",
      firstName: "Barb",
      middleName: "Whitaker",
      lastName: "Cragell",
      birthDate: "1960-11-07",
      gender: "male",
      role: "RESIDENT",
      lookupId: null,
      __typename: "Patient",
    },
    createdBy: {
      nameInfo: {
        firstName: "Arthur",
        middleName: "A",
        lastName: "Admin",
      },
    },
    patientLink: {
      internalId: "68c543e8-7c65-4047-955c-e3f65bb8b58a",
    },
    noSymptoms: true,
    symptoms: "{}",
    __typename: "TestResult",
  },
  {
    internalId: "7c768a5d-ef90-44cd-8050-b96dd7aaa1d5",
    dateTested: "2021-03-19T19:27:21.052Z",
    result: "POSITIVE",
    correctionStatus: "ORIGINAL",
    deviceType: {
      internalId: "8c1a8efe-8951-4f84-a4c9-dcea561d7fbb",
      name: "Abbott IDNow",
      __typename: "DeviceType",
    },
    patient: {
      internalId: "f74ad245-3a69-44b5-bb6d-efe06308bb85",
      firstName: "Sam",
      middleName: "G",
      lastName: "Gerard",
      birthDate: "1960-11-07",
      gender: "male",
      role: "RESIDENT",
      lookupId: null,
      __typename: "Patient",
    },
    createdBy: {
      nameInfo: {
        firstName: "Ethan",
        middleName: "",
        lastName: "Entry",
      },
    },
    patientLink: {
      internalId: "68c543e8-7c65-4047-955c-e3f65bb8b58a",
    },
    noSymptoms: false,
    symptoms: '{"someSymptom":"true"}',
    __typename: "TestResult",
  },
];

const testResultsByStartDate = [
  {
    internalId: "7c768a5d-ef90-44cd-8050-b96dd77f51d5",
    dateTested: "2021-03-18T19:27:21.052Z",
    result: "NEGATIVE",
    correctionStatus: "ORIGINAL",
    deviceType: {
      internalId: "8c1a8efe-8951-4f84-a4c9-dcea561d7fbb",
      name: "Abbott IDNow",
      __typename: "DeviceType",
    },
    patient: {
      internalId: "f74ad245-3a69-44b5-bb6d-efe06308bb85",
      firstName: "Barde",
      middleName: "X",
      lastName: "Colleer",
      birthDate: "1960-11-07",
      gender: "female",
      role: "STAFF",
      lookupId: null,
      __typename: "Patient",
    },
    createdBy: {
      nameInfo: {
        firstName: "Ursula",
        middleName: "",
        lastName: "User",
      },
    },
    patientLink: {
      internalId: "68c543e8-7c65-4047-955c-e3f65bb8b58a",
    },
    noSymptoms: false,
    symptoms: "{}",
    __typename: "TestResult",
  },
  {
    internalId: "7c768a5d-ef90-44cd-8050-b96dd7aaa1d5",
    dateTested: "2021-03-19T19:27:21.052Z",
    result: "POSITIVE",
    correctionStatus: "ORIGINAL",
    deviceType: {
      internalId: "8c1a8efe-8951-4f84-a4c9-dcea561d7fbb",
      name: "Abbott IDNow",
      __typename: "DeviceType",
    },
    patient: {
      internalId: "f74ad245-3a69-44b5-bb6d-efe06308bb85",
      firstName: "Sam",
      middleName: "G",
      lastName: "Gerard",
      birthDate: "1960-11-07",
      gender: "male",
      role: "RESIDENT",
      lookupId: null,
      __typename: "Patient",
    },
    createdBy: {
      nameInfo: {
        firstName: "Ethan",
        middleName: "",
        lastName: "Entry",
      },
    },
    patientLink: {
      internalId: "68c543e8-7c65-4047-955c-e3f65bb8b58a",
    },
    noSymptoms: false,
    symptoms: '{"someSymptom":"true"}',
    __typename: "TestResult",
  },
];

const testResultsByStartDateAndEndDate = [
  {
    internalId: "7c768a5d-ef90-44cd-8050-b96dd77f51d5",
    dateTested: "2021-03-18T19:27:21.052Z",
    result: "NEGATIVE",
    correctionStatus: "ORIGINAL",
    deviceType: {
      internalId: "8c1a8efe-8951-4f84-a4c9-dcea561d7fbb",
      name: "Abbott IDNow",
      __typename: "DeviceType",
    },
    patient: {
      internalId: "f74ad245-3a69-44b5-bb6d-efe06308bb85",
      firstName: "Barde",
      middleName: "X",
      lastName: "Colleer",
      birthDate: "1960-11-07",
      gender: "female",
      role: "STAFF",
      lookupId: null,
      __typename: "Patient",
    },
    createdBy: {
      nameInfo: {
        firstName: "Ursula",
        middleName: "",
        lastName: "User",
      },
    },
    patientLink: {
      internalId: "68c543e8-7c65-4047-955c-e3f65bb8b58a",
    },
    noSymptoms: false,
    symptoms: "{}",
    __typename: "TestResult",
  },
];

const patients = [
  {
    internalId: "48c523e8-7c65-4047-955c-e3f65bb8b58a",
    firstName: "Barb",
    middleName: "Whitaker",
    lastName: "Cragell",
    birthDate: "1960-11-07",
    gender: "male",
    role: "RESIDENT",
    lookupId: null,
    __typename: "Patient",
  },
];

const mocks = [
  {
    request: {
      query: resultsCountQuery,
      variables: {
        facilityId: "1",
      },
    },
    result: {
      data: {
        testResultsCount: testResults.length,
      },
    },
  },
  {
    request: {
      query: testResultQuery,
      variables: {
        facilityId: "1",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        testResults,
      },
    },
  },
  {
    request: {
      query: testResultDetailsQuery,
      variables: {
        id: testResults[0].internalId,
      },
    },
    result: {
      data: {
        testResult: {
          dateTested: "2021-03-17T19:27:23.806Z",
          result: "NEGATIVE",
          correctionStatus: "ORIGINAL",
          deviceType: {
            name: "Abbott IDNow",
            __typename: "DeviceType",
          },
          patient: {
            firstName: "Barb",
            middleName: "Whitaker",
            lastName: "Cragell",
            birthDate: "1960-11-07",
          },
          createdBy: {
            name: {
              firstName: "Arthur",
              middleName: "A",
              lastName: "Admin",
            },
          },
          symptoms: "{}",
          symptomOnset: null,
          __typename: "TestResult",
        },
      },
    },
  },
  {
    request: {
      query: resultsCountQuery,
      variables: {
        facilityId: "1",
        patientId: "48c523e8-7c65-4047-955c-e3f65bb8b58a",
      },
    },
    result: {
      data: {
        testResultsCount: testResultsByPatient.length,
      },
    },
  },
  {
    request: {
      query: testResultQuery,
      variables: {
        facilityId: "1",
        patientId: "48c523e8-7c65-4047-955c-e3f65bb8b58a",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        testResults: testResultsByPatient,
      },
    },
  },
  {
    request: {
      query: resultsCountQuery,
      variables: {
        facilityId: "1",
        result: "NEGATIVE",
      },
    },
    result: {
      data: {
        testResultsCount: testResultsByResultValue.length,
      },
    },
  },
  {
    request: {
      query: testResultQuery,
      variables: {
        facilityId: "1",
        result: "NEGATIVE",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        testResults: testResultsByResultValue,
      },
    },
  },
  {
    request: {
      query: resultsCountQuery,
      variables: {
        facilityId: "1",
        role: "RESIDENT",
      },
    },
    result: {
      data: {
        testResultsCount: testResultsByRole.length,
      },
    },
  },
  {
    request: {
      query: testResultQuery,
      variables: {
        facilityId: "1",
        role: "RESIDENT",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        testResults: testResultsByRole,
      },
    },
  },
  {
    request: {
      query: resultsCountQuery,
      variables: {
        facilityId: "1",
        startDate: "2021-03-18T00:00:00.000Z",
      },
    },
    result: {
      data: {
        testResultsCount: testResultsByStartDate.length,
      },
    },
  },
  {
    request: {
      query: testResultQuery,
      variables: {
        facilityId: "1",
        startDate: "2021-03-18T00:00:00.000Z",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        testResults: testResultsByStartDate,
      },
    },
  },
  {
    request: {
      query: resultsCountQuery,
      variables: {
        facilityId: "1",
        startDate: "2021-03-18T00:00:00.000Z",
        endDate: "2021-03-18T23:59:59.999Z",
      },
    },
    result: {
      data: {
        testResultsCount: testResultsByStartDateAndEndDate.length,
      },
    },
  },
  {
    request: {
      query: testResultQuery,
      variables: {
        facilityId: "1",
        startDate: "2021-03-18T00:00:00.000Z",
        endDate: "2021-03-18T23:59:59.999Z",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        testResults: testResultsByStartDateAndEndDate,
      },
    },
  },
  {
    request: {
      query: QUERY_PATIENT,
      variables: {
        facilityId: "1",
        namePrefixMatch: "Cragell",
      },
    },
    result: {
      data: {
        patients,
      },
    },
  },
  {
    request: {
      query: resultsCountQuery,
      variables: {
        facilityId: "1",
      },
    },
    result: {
      data: {
        testResultsCount: testResults.length,
      },
    },
  },
  {
    request: {
      query: testResultQuery,
      variables: {
        facilityId: "1",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        testResults,
      },
    },
  },
];

describe("TestResultsList", () => {
  it("should render a list of tests", async () => {
    const { container } = render(
      <WithRouter>
        <DetachedTestResultsList
          data={{ testResults }}
          pageNumber={1}
          entriesPerPage={20}
          totalEntries={testResults.length}
          filterParams={{}}
          setFilterParams={() => () => {}}
          clearFilterParams={() => {}}
          facilityId={"1"}
          loading={false}
          loadingTotalResults={false}
          refetch={() => {}}
        />
      </WithRouter>
    );

    expect(
      await screen.findByText("Test Results", { exact: false })
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Cragell, Barb Whitaker")
    ).toBeInTheDocument();
    expect(await screen.findByText("Showing 1-3 of 3")).toBeInTheDocument();

    expect(container).toMatchSnapshot();
  });
  it("should be able to load filter params from url", async () => {
    const localMocks = [
      {
        request: {
          query: resultsCountQuery,
          variables: {
            facilityId: "1",
            patientId: "48c523e8-7c65-4047-955c-e3f65bb8b58a",
            startDate: "2021-03-18T00:00:00.000Z",
            endDate: "2021-03-19T23:59:59.999Z",
            role: "STAFF",
            result: "NEGATIVE",
          },
        },
        result: {
          data: {
            testResultsCount: testResultsByStartDateAndEndDate.length,
          },
        },
      },
      {
        request: {
          query: testResultQuery,
          variables: {
            facilityId: "1",
            pageNumber: 0,
            pageSize: 20,
            patientId: "48c523e8-7c65-4047-955c-e3f65bb8b58a",
            startDate: "2021-03-18T00:00:00.000Z",
            endDate: "2021-03-19T23:59:59.999Z",
            role: "STAFF",
            result: "NEGATIVE",
          },
        },
        result: {
          data: {
            testResults: testResultsByStartDateAndEndDate,
          },
        },
      },
    ];
    const search = {
      patientId: "48c523e8-7c65-4047-955c-e3f65bb8b58a",
      startDate: "2021-03-18T00:00:00.000Z",
      endDate: "2021-03-19T23:59:59.999Z",
      result: "NEGATIVE",
      role: "STAFF",
      facility: "1",
    };

    await render(
      <MemoryRouter
        initialEntries={[
          { pathname: "/results/1", search: qs.stringify(search) },
        ]}
      >
        <Provider store={store}>
          <MockedProvider mocks={localMocks}>
            <TestResultsList pageNumber={1} />
          </MockedProvider>
        </Provider>
      </MemoryRouter>
    );

    expect(await screen.findByText("Showing 1-1 of 1")).toBeInTheDocument();
    expect(
      await screen.findByLabelText("Date range (start)")
    ).toBeInTheDocument();
    expect(await screen.findByDisplayValue("03/18/2021")).toBeInTheDocument();

    expect(
      await screen.findByLabelText("Date range (end)")
    ).toBeInTheDocument();
    expect(await screen.findByDisplayValue("03/19/2021")).toBeInTheDocument();

    const roleSelect = (await screen.findByLabelText(
      "Role"
    )) as HTMLSelectElement;
    expect(roleSelect).toBeInTheDocument();
    expect(roleSelect.value).toEqual("STAFF");

    const resultSelect = (await screen.findByLabelText(
      "Result"
    )) as HTMLSelectElement;
    expect(resultSelect).toBeInTheDocument();
    expect(resultSelect.value).toEqual("NEGATIVE");

    const searchBox = screen.getByLabelText(
      "Search by name"
    ) as HTMLInputElement;
    expect(searchBox.value).toEqual("Colleer, Barde X");

    const row = within(await screen.findByTitle("filtered-result"));
    expect(await row.findByText("Colleer, Barde X")).toBeInTheDocument();
    expect(await row.findByText("DOB: 11/07/1960")).toBeInTheDocument();
    expect(await row.findByText("Negative")).toBeInTheDocument();
    expect(await row.findByText("Abbott IDNow")).toBeInTheDocument();
    expect(await row.findByText("User, Ursula")).toBeInTheDocument();
  });
  it("should call appropriate gql endpoints for pagination", async () => {
    render(
      <WithRouter>
        <Provider store={store}>
          <MockedProvider mocks={mocks}>
            <TestResultsList pageNumber={1} />
          </MockedProvider>
        </Provider>
      </WithRouter>
    );
    expect(
      await screen.findByText("Test Results", { exact: false })
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Cragell, Barb Whitaker")
    ).toBeInTheDocument();
  });

  it("should be able to filter by patient", async () => {
    render(
      <WithRouter>
        <Provider store={store}>
          <MockedProvider mocks={mocks}>
            <TestResultsList pageNumber={1} />
          </MockedProvider>
        </Provider>
      </WithRouter>
    );
    expect(
      await screen.findByText("Test Results", { exact: false })
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Cragell, Barb Whitaker")
    ).toBeInTheDocument();
    expect(await screen.findByText("Colleer, Barde X")).toBeInTheDocument();
    expect(await screen.findByText("Search by name")).toBeInTheDocument();
    userEvent.type(screen.getByRole("searchbox"), "Cragell");
    expect(await screen.findByText("Filter")).toBeInTheDocument();
    userEvent.click(screen.getByText("Filter"));
    expect(
      await screen.findByText("Cragell, Barb Whitaker")
    ).toBeInTheDocument();
    expect(screen.queryByText("Colleer, Barde X")).not.toBeInTheDocument();
    expect(screen.getByRole("searchbox").getAttribute("value")).toBe(
      "Cragell, Barb Whitaker"
    );
  });
  it("should be able to filter by result value", async () => {
    render(
      <WithRouter>
        <Provider store={store}>
          <MockedProvider mocks={mocks}>
            <TestResultsList pageNumber={1} />
          </MockedProvider>
        </Provider>
      </WithRouter>
    );
    expect(
      await screen.findByText("Test Results", { exact: false })
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Cragell, Barb Whitaker")
    ).toBeInTheDocument();
    expect(await screen.findByText("Gerard, Sam G")).toBeInTheDocument();
    expect(
      await screen.findByRole("option", { name: "Negative" })
    ).toBeInTheDocument();
    userEvent.selectOptions(screen.getByLabelText("Result"), ["NEGATIVE"]);
    expect(
      await screen.findByText("Cragell, Barb Whitaker")
    ).toBeInTheDocument();
    expect(screen.queryByText("Gerard, Sam G")).not.toBeInTheDocument();
  });
  it("should be able to filter by role", async () => {
    render(
      <WithRouter>
        <Provider store={store}>
          <MockedProvider mocks={mocks}>
            <TestResultsList pageNumber={1} />
          </MockedProvider>
        </Provider>
      </WithRouter>
    );
    expect(
      await screen.findByText("Test Results", { exact: false })
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Cragell, Barb Whitaker")
    ).toBeInTheDocument();
    expect(await screen.findByText("Colleer, Barde X")).toBeInTheDocument();
    expect(
      await screen.findByRole("option", { name: "Resident" })
    ).toBeInTheDocument();
    userEvent.selectOptions(screen.getByLabelText("Role"), ["RESIDENT"]);
    expect(
      await screen.findByText("Cragell, Barb Whitaker")
    ).toBeInTheDocument();
    expect(screen.queryByText("Colleer, Barde X")).not.toBeInTheDocument();
  });
  it("should be able to filter by date", async () => {
    render(
      <WithRouter>
        <Provider store={store}>
          <MockedProvider mocks={mocks}>
            <TestResultsList pageNumber={1} />
          </MockedProvider>
        </Provider>
      </WithRouter>
    );
    expect(
      await screen.findByText("Test Results", { exact: false })
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Cragell, Barb Whitaker")
    ).toBeInTheDocument();
    expect(await screen.findByText("Colleer, Barde X")).toBeInTheDocument();
    expect(await screen.findByText("Gerard, Sam G")).toBeInTheDocument();
    expect(await screen.findByText("Date range (start)")).toBeInTheDocument();
    expect(await screen.findByText("Date range (end)")).toBeInTheDocument();
    userEvent.type(
      screen.getAllByTestId("date-picker-external-input")[0],
      "03/18/2021"
    );
    userEvent.tab();
    expect(await screen.findByText("Colleer, Barde X")).toBeInTheDocument();
    expect(await screen.findByText("Gerard, Sam G")).toBeInTheDocument();
    expect(
      screen.queryByText("Cragell, Barb Whitaker")
    ).not.toBeInTheDocument();
    userEvent.type(
      screen.getAllByTestId("date-picker-external-input")[1],
      "03/18/2021"
    );
    userEvent.tab();
    expect(await screen.findByText("Colleer, Barde X")).toBeInTheDocument();
    expect(await screen.queryByText("Gerard, Sam G")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Cragell, Barb Whitaker")
    ).not.toBeInTheDocument();
  });
  it("should be able to clear patient filter", async () => {
    render(
      <WithRouter>
        <Provider store={store}>
          <MockedProvider mocks={mocks}>
            <TestResultsList pageNumber={1} />
          </MockedProvider>
        </Provider>
      </WithRouter>
    );

    expect(
      await screen.findByText("Test Results", { exact: false })
    ).toBeInTheDocument();

    // Apply filter
    expect(await screen.findByText("Search by name")).toBeInTheDocument();
    userEvent.type(screen.getByRole("searchbox"), "Cragell");
    expect(await screen.findByText("Filter")).toBeInTheDocument();
    userEvent.click(screen.getByText("Filter"));

    // Clear filter
    expect(await screen.findByText("Clear filters")).toBeInTheDocument();
    userEvent.click(screen.getByText("Clear filters"));

    // All results, filter no longer applied
    expect(
      await screen.findByText("Cragell, Barb Whitaker")
    ).toBeInTheDocument();
    expect(await screen.queryByText("Colleer, Barde X")).toBeInTheDocument();
  });

  it("should be able to clear date filters", async () => {
    render(
      <WithRouter>
        <Provider store={store}>
          <MockedProvider mocks={mocks}>
            <TestResultsList pageNumber={1} />
          </MockedProvider>
        </Provider>
      </WithRouter>
    );

    // Apply filter
    userEvent.type(
      screen.getAllByTestId("date-picker-external-input")[0],
      "03/18/2021"
    );

    userEvent.tab();

    // Filter applied
    expect(await screen.findByText("Colleer, Barde X")).toBeInTheDocument();
    expect(await screen.findByText("Gerard, Sam G")).toBeInTheDocument();
    expect(
      screen.queryByText("Cragell, Barb Whitaker")
    ).not.toBeInTheDocument();

    expect(
      screen
        .getAllByTestId("date-picker-external-input")[0]
        .getAttribute("value")
    ).toEqual("03/18/2021");
    // Clear filter
    expect(await screen.findByText("Clear filters")).toBeInTheDocument();
    userEvent.click(screen.getByText("Clear filters"));

    // Filter no longer applied
    expect(
      await screen.findByText("Cragell, Barb Whitaker")
    ).toBeInTheDocument();

    // Date picker no longer displays the selected date
    expect(
      screen
        .getAllByTestId("date-picker-external-input")[0]
        .getAttribute("value")
    ).toEqual("");
  });

  it("opens the test detail view", async () => {
    render(
      <WithRouter>
        <Provider store={store}>
          <MockedProvider mocks={mocks}>
            <TestResultsList pageNumber={1} />
          </MockedProvider>
        </Provider>
      </WithRouter>
    );
    await screen.findByText("Test Results", { exact: false });
    const moreActions = within(screen.getByRole("table")).getAllByRole(
      "button"
    )[0];
    userEvent.click(moreActions);
    const viewDetails = await screen.findByText("View details");
    userEvent.click(viewDetails);
    expect(screen.queryAllByText("Test details").length).toBe(2);
  });

  it("opens the email test results modal", async () => {
    render(
      <WithRouter>
        <Provider store={store}>
          <MockedProvider mocks={mocks}>
            <TestResultsList pageNumber={1} />
          </MockedProvider>
        </Provider>
      </WithRouter>
    );
    await screen.findByText("Test Results", { exact: false });
    const moreActions = within(screen.getByRole("table")).getAllByRole(
      "button"
    )[0];
    userEvent.click(moreActions);
    const emailResult = await screen.findByText("Email result");
    userEvent.click(emailResult);
    expect(screen.getByText("Email results?")).toBeInTheDocument();
  });

  it("doesn't display anything if no facility is selected", async () => {
    render(
      <MemoryRouter>
        <Provider store={store}>
          <MockedProvider mocks={mocks}>
            <TestResultsList pageNumber={1} />
          </MockedProvider>
        </Provider>
      </MemoryRouter>
    );
    expect(
      await screen.findByText("No facility selected", { exact: false })
    ).toBeInTheDocument();
  });
});
