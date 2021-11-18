import { BrowserRouter as Router, MemoryRouter, Route } from "react-router-dom";
import { Provider } from "react-redux";
import createMockStore, { MockStoreEnhanced } from "redux-mock-store";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { GetTopLevelDashboardMetricsNewDocument } from "../generated/graphql";

import App, { WHOAMI_QUERY } from "./App";
import { queueQuery } from "./testQueue/TestQueue";
import PrimeErrorBoundary from "./PrimeErrorBoundary";
import { TRAINING_PURPOSES_ONLY } from "./commonComponents/TrainingNotification";
import {
  getStartDateFromDaysAgo,
  getEndDateFromDaysAgo,
} from "./analytics/Analytics";

jest.mock("uuid");
jest.mock("./VersionService", () => ({
  VersionService: {
    enforce: jest.fn(),
  },
}));
jest.mock("./testResults/CleanTestResultsList", () => {
  return () => <p>CleanTestResultsList</p>;
});
jest.mock("./testResults/TestResultsList", () => {
  return () => <p>TestResultsList</p>;
});

const mockStore = createMockStore([]);
const mockDispatch = jest.fn();

const store = {
  dispatch: jest.fn(),
  organization: {
    name: "Organization Name",
  },
  user: {
    id: "05b2f71a-9392-442b-aab5-4eb550a864c0",
    firstName: "Bob",
    middleName: null,
    lastName: "Bobberoo",
    suffix: null,
    email: "bob@example.com",
    roleDescription: "Admin user",
    isAdmin: false,
    permissions: [
      "EDIT_PATIENT",
      "ARCHIVE_PATIENT",
      "READ_PATIENT_LIST",
      "EDIT_ORGANIZATION",
      "START_TEST",
      "EDIT_FACILITY",
      "ACCESS_ALL_FACILITIES",
      "READ_RESULT_LIST",
      "READ_ARCHIVED_PATIENT_LIST",
      "SUBMIT_TEST",
      "MANAGE_USERS",
      "SEARCH_PATIENTS",
      "UPDATE_TEST",
    ],
  },
  facilities: [
    {
      id: "fec4de56-f4cc-4c61-b3d5-76869ca71296",
      name: "Testing Site",
    },
  ],
  facility: {
    id: "fec4de56-f4cc-4c61-b3d5-76869ca71296",
    name: "Testing Site",
  },
};

store.dispatch = mockDispatch;

const WhoAmIQueryMock = {
  request: {
    query: WHOAMI_QUERY,
    fetchPolicy: "no-cache",
  },
  result: {
    data: {
      whoami: {
        id: "05b2f71a-9392-442b-aab5-4eb550a864c0",
        firstName: "Bob",
        middleName: null,
        lastName: "Bobberoo",
        suffix: null,
        email: "bob@example.com",
        isAdmin: false,
        permissions: [
          "EDIT_PATIENT",
          "ARCHIVE_PATIENT",
          "READ_PATIENT_LIST",
          "EDIT_ORGANIZATION",
          "START_TEST",
          "EDIT_FACILITY",
          "ACCESS_ALL_FACILITIES",
          "READ_RESULT_LIST",
          "READ_ARCHIVED_PATIENT_LIST",
          "SUBMIT_TEST",
          "MANAGE_USERS",
          "SEARCH_PATIENTS",
          "UPDATE_TEST",
        ],
        roleDescription: "Admin user",
        organization: {
          name: "Dis Organization",
          testingFacility: [
            {
              id: "fec4de56-f4cc-4c61-b3d5-76869ca71296",
              name: "Testing Site",
            },
          ],
        },
      },
    },
  },
};
const facilityQueryMock = {
  request: {
    query: queueQuery,
    fetchPolicy: "no-cache",
    variables: {
      facilityId: "fec4de56-f4cc-4c61-b3d5-76869ca71296",
    },
  },
  result: {
    data: {
      queue: [],
      organization: {
        testingFacility: [
          {
            id: "fec4de56-f4cc-4c61-b3d5-76869ca71296",
            deviceTypes: [
              {
                internalId: "d70bb3b8-96bd-40d9-a3ce-b266a7edb91d",
                name: "Quidel Sofia 2",
                model: "Sofia 2 SARS Antigen FIA",
                testLength: 15,
              },
              {
                internalId: "5e44dcef-8cc6-44f4-a200-a5b8169ab60a",
                name: "LumiraDX",
                model: "LumiraDx SARS-CoV-2 Ag Test*",
                testLength: 15,
              },
            ],
            defaultDeviceType: {
              internalId: "5e44dcef-8cc6-44f4-a200-a5b8169ab60a",
              name: "LumiraDX",
              model: "LumiraDx SARS-CoV-2 Ag Test*",
              testLength: 15,
            },
          },
        ],
      },
    },
  },
};
const WhoAmIErrorQueryMock = {
  request: {
    query: WHOAMI_QUERY,
    fetchPolicy: "no-cache",
  },
  error: new Error("Server connection error"),
};
const getAnalyticsQueryMock = () => ({
  request: {
    query: GetTopLevelDashboardMetricsNewDocument,
    variables: {
      facilityId: "",
      startDate: getStartDateFromDaysAgo(7),
      endDate: getEndDateFromDaysAgo(0),
    },
  },
  result: {
    data: {
      topLevelDashboardMetrics: {
        totalTestCount: 124820,
        positiveTestCount: 2270,
      },
    },
  },
});
const renderApp = (
  newStore: MockStoreEnhanced<unknown, {}>,
  queryMocks: MockedResponse[]
) => {
  return render(
    <PrimeErrorBoundary>
      <Provider store={newStore}>
        <MockedProvider mocks={queryMocks} addTypename={false}>
          <Router>
            <Route path="/" component={App} />
          </Router>
        </MockedProvider>
      </Provider>
    </PrimeErrorBoundary>
  );
};

const MODAL_TEXT = "Welcome to the SimpleReport";

describe("App", () => {
  beforeEach(() => {
    jest
      .useFakeTimers("modern")
      .setSystemTime(new Date("2021-08-01").getTime());
  });

  afterEach(() => {
    jest.useRealTimers();
  });
  it("Render first loading screen", async () => {
    const mockedStore = mockStore({});
    renderApp(mockedStore, [WhoAmIQueryMock]);
    await screen.findByText("Loading account information...");
  });

  it("Render facility loading", async () => {
    const mockedStore = mockStore({ ...store });
    renderApp(mockedStore, [WhoAmIQueryMock, facilityQueryMock]);
    await screen.findByText("Loading facility information...");
  });

  it("Render main screen", async () => {
    const mockedStore = mockStore({ ...store, dataLoaded: true });
    renderApp(mockedStore, [
      WhoAmIQueryMock,
      facilityQueryMock,
      getAnalyticsQueryMock(),
    ]);
    await waitFor(() => {
      userEvent.click(screen.getByText("Testing Site", { exact: false }));
    });
    expect(
      await screen.findByText("COVID-19 testing data")
    ).toBeInTheDocument();
  });
  it("should show error UI", async () => {
    const mockedStore = mockStore({ ...store, dataLoaded: true });
    const { container } = renderApp(mockedStore, [WhoAmIErrorQueryMock]);
    await screen.findByText("error", { exact: false });
    expect(container).toMatchSnapshot();
  });
  it("displays the training header and modal and dismisses the modal", async () => {
    process.env.REACT_APP_IS_TRAINING_SITE = "true";
    const mockedStore = mockStore({ ...store, dataLoaded: true });
    renderApp(mockedStore, [
      WhoAmIQueryMock,
      facilityQueryMock,
      getAnalyticsQueryMock(),
    ]);
    expect(await screen.findAllByText(TRAINING_PURPOSES_ONLY)).toHaveLength(2);
    const trainingWelcome = await screen.findByText(MODAL_TEXT, {
      exact: false,
    });
    expect(trainingWelcome).toBeInTheDocument();
    await waitFor(() => {
      userEvent.click(screen.getByText("Got it", { exact: false }));
    });
    expect(trainingWelcome).not.toBeInTheDocument();
  });
  it("does not display training notifications outside the training environment", () => {
    process.env.REACT_APP_IS_TRAINING_SITE = "false";
    const mockedStore = mockStore({ ...store, dataLoaded: true });
    renderApp(mockedStore, [WhoAmIQueryMock, facilityQueryMock]);
    expect(screen.queryByText(TRAINING_PURPOSES_ONLY)).not.toBeInTheDocument();
    expect(screen.queryByText(MODAL_TEXT)).not.toBeInTheDocument();
  });
  it("renders CleanTestResultsList when going to /results/", async () => {
    const mockedStore = mockStore({ ...store, dataLoaded: true });

    await render(
      <Provider store={mockedStore}>
        <MockedProvider mocks={[WhoAmIQueryMock]} addTypename={false}>
          <MemoryRouter
            initialEntries={[
              `/results?facility=fec4de56-f4cc-4c61-b3d5-76869ca71296`,
            ]}
          >
            <App />
          </MemoryRouter>
        </MockedProvider>
      </Provider>
    );

    expect(await screen.findByText("CleanTestResultsList")).toBeInTheDocument();
  });

  it("renders TestResultsList when going to /results/page_number ", async () => {
    const mockedStore = mockStore({ ...store, dataLoaded: true });

    await render(
      <Provider store={mockedStore}>
        <MockedProvider mocks={[WhoAmIQueryMock]} addTypename={false}>
          <MemoryRouter
            initialEntries={[
              `/results/1?facility=fec4de56-f4cc-4c61-b3d5-76869ca71296`,
            ]}
          >
            <App />
          </MemoryRouter>
        </MockedProvider>
      </Provider>
    );

    expect(await screen.findByText("TestResultsList")).toBeInTheDocument();
  });
});
