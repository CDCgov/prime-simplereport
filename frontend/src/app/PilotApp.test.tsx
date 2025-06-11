import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import createMockStore, { MockStoreEnhanced } from "redux-mock-store";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import jwtDecode from "jwt-decode";
import MockDate from "mockdate";
import * as flaggedMock from "flagged";

import { GetTopLevelDashboardMetricsNewDocument } from "../generated/graphql";

import { WHOAMI_QUERY } from "./ReportingApp";
import PrimeErrorBoundary from "./PrimeErrorBoundary";
import { TRAINING_PURPOSES_ONLY } from "./commonComponents/TrainingNotification";
import {
  getEndDateFromDaysAgo,
  getStartDateFromDaysAgo,
} from "./analytics/Analytics";
import { getAppInsights } from "./TelemetryService";
import { WhoAmIQueryMock } from "./OperationMocks";
import PilotApp from "./PilotApp";

const mockDispatch = jest.fn();

jest.mock("uuid");
jest.mock("./VersionService", () => ({
  VersionService: {
    enforce: jest.fn(),
  },
}));
jest.mock("./TelemetryService", () => ({
  ...jest.requireActual("./TelemetryService"),
  getAppInsights: jest.fn(),
}));
jest.mock("jwt-decode", () => jest.fn());

const mockStore = createMockStore([]);

const store = {
  dispatch: mockDispatch,
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
      disease: "COVID-19",
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
  return {
    user: userEvent.setup(),
    ...render(
      <PrimeErrorBoundary>
        <Provider store={newStore}>
          <MockedProvider mocks={queryMocks} addTypename={false}>
            <MemoryRouter>
              <Routes>
                <Route path="/*" element={<PilotApp />} />
              </Routes>
            </MemoryRouter>
          </MockedProvider>
        </Provider>
      </PrimeErrorBoundary>
    ),
  };
};

const MODAL_TEXT = "Welcome to the SimpleReport";

describe("App", () => {
  beforeEach(() => {
    MockDate.set("2021-08-01");
  });

  afterEach(() => {
    MockDate.reset();
  });

  it("Renders loading mask for account", async () => {
    const mockedStore = mockStore({ ...store });
    renderApp(mockedStore, [WhoAmIQueryMock]);
    expect(await screen.findByText("Loading account information..."));
  });

  it("Renders pilot landing page", async () => {
    const flagSpy = jest.spyOn(flaggedMock, "useFeature");
    flagSpy.mockImplementation(() => true);
    const mockedStore = mockStore({ ...store, dataLoaded: true });
    renderApp(mockedStore, [WhoAmIQueryMock, getAnalyticsQueryMock()]);

    await waitForElementToBeRemoved(() =>
      screen.queryByText("Loading account information...")
    );

    expect(
      await screen.findByText("I want to enter results individually", {
        exact: false,
      })
    ).toBeInTheDocument();
  });

  it("Renders form when clicking enter lab results", async () => {
    const flagSpy = jest.spyOn(flaggedMock, "useFeature");
    flagSpy.mockImplementation(() => true);
    const mockedStore = mockStore({ ...store, dataLoaded: true });
    const { user } = renderApp(mockedStore, [
      WhoAmIQueryMock,
      getAnalyticsQueryMock(),
    ]);

    await waitForElementToBeRemoved(() =>
      screen.queryByText("Loading account information...")
    );

    await user.click(screen.getByText("Enter lab results", { exact: false }));

    expect(
      await screen.findByText("Next: Provider information", {
        exact: false,
      })
    ).toBeInTheDocument();
  });

  it("Renders page not found when flag is disabled", async () => {
    const flagSpy = jest.spyOn(flaggedMock, "useFeature");
    flagSpy.mockImplementation(
      (flagName) => flagName !== "universalReportingEnabled"
    );
    const mockedStore = mockStore({ ...store, dataLoaded: true });
    renderApp(mockedStore, [WhoAmIQueryMock, getAnalyticsQueryMock()]);

    await waitForElementToBeRemoved(() =>
      screen.queryByText("Loading account information...")
    );

    expect(await screen.findByText("Page not found")).toBeInTheDocument();

    expect(
      screen.queryByText("I want to enter results individually", {
        exact: false,
      })
    ).not.toBeInTheDocument();
  });

  it("should show error UI", async () => {
    const mockedStore = mockStore({ ...store, dataLoaded: true });
    const { container } = renderApp(mockedStore, [WhoAmIErrorQueryMock]);
    await screen.findByText("error", { exact: false });
    expect(container).toMatchSnapshot();
  });

  it("displays the training header and modal and dismisses the modal", async () => {
    const flagSpy = jest.spyOn(flaggedMock, "useFeature");
    flagSpy.mockImplementation(() => true);
    process.env.REACT_APP_IS_TRAINING_SITE = "true";
    const mockedStore = mockStore({ ...store, dataLoaded: true });
    const { user } = renderApp(mockedStore, [
      WhoAmIQueryMock,
      getAnalyticsQueryMock(),
    ]);
    expect(await screen.findAllByText(TRAINING_PURPOSES_ONLY)).toHaveLength(2);
    const trainingWelcome = await screen.findByText(MODAL_TEXT, {
      exact: false,
    });
    expect(trainingWelcome).toBeInTheDocument();

    await user.click(screen.getByText("Got it", { exact: false }));
    expect(trainingWelcome).not.toBeInTheDocument();
  });

  it("does not display training notifications outside the training environment", () => {
    const flagSpy = jest.spyOn(flaggedMock, "useFeature");
    flagSpy.mockImplementation(() => true);
    process.env.REACT_APP_IS_TRAINING_SITE = "false";
    const mockedStore = mockStore({ ...store, dataLoaded: true });
    renderApp(mockedStore, [WhoAmIQueryMock]);
    expect(screen.queryByText(TRAINING_PURPOSES_ONLY)).not.toBeInTheDocument();
    expect(screen.queryByText(MODAL_TEXT)).not.toBeInTheDocument();
  });

  describe("logs to App Insights on WhoAmI error", () => {
    const oldTokenClaim = process.env.REACT_APP_OKTA_TOKEN_ROLE_CLAIM;
    const trackExceptionMock = jest.fn();

    beforeEach(() => {
      process.env.REACT_APP_OKTA_TOKEN_ROLE_CLAIM = "test_roles";
      trackExceptionMock.mockReset();
      (getAppInsights as jest.Mock).mockImplementation(() => {
        const ai = Object.create(ApplicationInsights.prototype);
        return Object.assign(ai, { trackException: trackExceptionMock });
      });
    });
    afterEach(() => {
      process.env.REACT_APP_OKTA_TOKEN_ROLE_CLAIM = oldTokenClaim;
      jest.spyOn(Storage.prototype, "getItem").mockRestore();
    });
    it("logs with access token info", async () => {
      jest
        .spyOn(Storage.prototype, "getItem")
        .mockImplementation(() => "definitely a valid token");
      (jwtDecode as jest.Mock).mockReturnValue({
        sub: "subject@fakeorg.net",
        test_roles: [
          "SR-FAKE-TENANT:XX-TestOrg-123:NO_ACCESS",
          "SR-FAKE-TENANT:XX-TestOrg-123:USER",
        ],
      });
      const mockedStore = mockStore({ ...store, dataLoaded: true });

      renderApp(mockedStore, [WhoAmIErrorQueryMock]);
      await screen.findByText("error", { exact: false });

      expect(trackExceptionMock).toHaveBeenCalledWith({
        exception: new Error("Server connection error"),
        properties: {
          "user message": "Server connection error",
          "valid access token": true,
          "token subject": "subject@fakeorg.net",
          "token roles": [
            "SR-FAKE-TENANT:XX-TestOrg-123:NO_ACCESS",
            "SR-FAKE-TENANT:XX-TestOrg-123:USER",
          ],
        },
      });
    });
    it("still logs if missing token", async () => {
      const mockedStore = mockStore({ ...store, dataLoaded: true });
      jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => null);

      renderApp(mockedStore, [WhoAmIErrorQueryMock]);
      await screen.findByText("error", { exact: false });

      expect(trackExceptionMock).toHaveBeenCalledWith({
        exception: new Error("Server connection error"),
        properties: {
          "user message": "Server connection error",
          "valid access token": null,
          "token subject": undefined,
          "token roles": undefined,
        },
      });
    });
    it("still logs if invalid token", async () => {
      jest
        .spyOn(Storage.prototype, "getItem")
        .mockImplementation(() => "definitely NOT a valid token");
      jest.spyOn(console, "error").mockImplementation(() => {});
      (jwtDecode as jest.Mock).mockImplementation(() => {
        throw new Error("InvalidToken");
      });
      const mockedStore = mockStore({ ...store, dataLoaded: true });

      renderApp(mockedStore, [WhoAmIErrorQueryMock]);
      await screen.findByText("error", { exact: false });

      expect(trackExceptionMock).toHaveBeenCalledWith({
        exception: new Error("Server connection error"),
        properties: {
          "user message": "Server connection error",
          "valid access token": false,
          "token subject": undefined,
          "token roles": undefined,
        },
      });
    });
  });
});
