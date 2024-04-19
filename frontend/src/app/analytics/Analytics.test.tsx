import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing";
import createMockStore from "redux-mock-store";
import { Provider } from "react-redux";
import MockDate from "mockdate";
import * as flaggedMock from "flagged";

import { GetTopLevelDashboardMetricsNewDocument } from "../../generated/graphql";
import { PATIENT_TERM_PLURAL } from "../../config/constants";

import {
  Analytics,
  getStartDateFromDaysAgo,
  getEndDateFromDaysAgo,
  setStartTimeForDateRange,
  setEndTimeForDateRange,
} from "./Analytics";

const mockStore = createMockStore([]);

const store = mockStore({
  organization: {
    name: "Central Schools",
  },
  facilities: [
    { id: "1", name: "Lincoln Middle School" },
    { id: "2", name: "Rosa Parks High School" },
    { id: "3", name: "Empty School" },
  ],
});

beforeAll(() => {
  MockDate.set("2021-08-01");
});

const getMocks = () => [
  {
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
  },
  {
    request: {
      query: GetTopLevelDashboardMetricsNewDocument,
      variables: {
        facilityId: "",
        startDate: getStartDateFromDaysAgo(1),
        endDate: getEndDateFromDaysAgo(0),
        disease: "COVID-19",
      },
    },
    result: {
      data: {
        topLevelDashboardMetrics: {
          totalTestCount: 120,
          positiveTestCount: 11,
        },
      },
    },
  },
  {
    request: {
      query: GetTopLevelDashboardMetricsNewDocument,
      variables: {
        facilityId: "",
        startDate: getStartDateFromDaysAgo(30),
        endDate: getEndDateFromDaysAgo(0),
        disease: "COVID-19",
      },
    },
    result: {
      data: {
        topLevelDashboardMetrics: {
          totalTestCount: 623492,
          positiveTestCount: 34971,
        },
      },
    },
  },
  {
    request: {
      query: GetTopLevelDashboardMetricsNewDocument,
      variables: {
        facilityId: "1",
        startDate: getStartDateFromDaysAgo(7),
        endDate: getEndDateFromDaysAgo(0),
        disease: "COVID-19",
      },
    },
    result: {
      data: {
        topLevelDashboardMetrics: {
          totalTestCount: 72341,
          positiveTestCount: 1000,
        },
      },
    },
  },
  {
    request: {
      query: GetTopLevelDashboardMetricsNewDocument,
      variables: {
        facilityId: "2",
        startDate: getStartDateFromDaysAgo(7),
        endDate: getEndDateFromDaysAgo(0),
        disease: "COVID-19",
      },
    },
    result: {
      data: {
        topLevelDashboardMetrics: {
          totalTestCount: 52479,
          positiveTestCount: 1270,
        },
      },
    },
  },
  {
    request: {
      query: GetTopLevelDashboardMetricsNewDocument,
      variables: {
        facilityId: "",
        startDate: setStartTimeForDateRange(new Date("07/01/2021")),
        endDate: setEndTimeForDateRange(new Date("07/31/2021")),
        disease: "COVID-19",
      },
    },
    result: {
      data: {
        topLevelDashboardMetrics: {
          totalTestCount: 14982,
          positiveTestCount: 953,
        },
      },
    },
  },
  {
    request: {
      query: GetTopLevelDashboardMetricsNewDocument,
      variables: {
        facilityId: "",
        startDate: setStartTimeForDateRange(new Date("07/01/2021")),
        endDate: getEndDateFromDaysAgo(0),
        disease: "COVID-19",
      },
    },
    result: {
      data: {
        topLevelDashboardMetrics: {
          totalTestCount: 14982,
          positiveTestCount: 953,
        },
      },
    },
  },
  {
    request: {
      query: GetTopLevelDashboardMetricsNewDocument,
      variables: {
        facilityId: "3",
        startDate: getStartDateFromDaysAgo(7),
        endDate: getEndDateFromDaysAgo(0),
        disease: "COVID-19",
      },
    },
    result: {
      data: {
        topLevelDashboardMetrics: {
          totalTestCount: 0,
          positiveTestCount: 0,
        },
      },
    },
  },
  {
    request: {
      query: GetTopLevelDashboardMetricsNewDocument,
      variables: {
        facilityId: "3",
        startDate: getStartDateFromDaysAgo(30),
        endDate: getEndDateFromDaysAgo(0),
        disease: "COVID-19",
      },
    },
    result: {
      data: {
        topLevelDashboardMetrics: {
          totalTestCount: 5,
          positiveTestCount: 0,
        },
      },
    },
  },
  {
    request: {
      query: GetTopLevelDashboardMetricsNewDocument,
      variables: {
        facilityId: "3",
        startDate: getStartDateFromDaysAgo(7),
        endDate: getEndDateFromDaysAgo(0),
        disease: "COVID-19",
      },
    },
    result: {
      data: {
        topLevelDashboardMetrics: {
          totalTestCount: 5,
          positiveTestCount: 0,
        },
      },
    },
  },
  {
    request: {
      query: GetTopLevelDashboardMetricsNewDocument,
      variables: {
        facilityId: "",
        startDate: getStartDateFromDaysAgo(7),
        endDate: getEndDateFromDaysAgo(0),
        disease: "Flu A",
      },
    },
    result: {
      data: {
        topLevelDashboardMetrics: {
          totalTestCount: 736,
          positiveTestCount: 289,
        },
      },
    },
  },
];

describe("Analytics", () => {
  const renderWithUser = () => ({
    user: userEvent.setup(),
    ...render(
      <MockedProvider mocks={getMocks()}>
        <Provider store={store}>
          <Analytics />
        </Provider>
      </MockedProvider>
    ),
  });
  beforeEach(() => {
    MockDate.set("2021-08-01");
  });

  afterEach(() => {
    MockDate.reset();
  });

  it("renders", async () => {
    renderWithUser();
    expect(
      await screen.findByText("Central Schools - COVID-19 testing data")
    ).toBeInTheDocument();
  });
  it("shows the total test count", async () => {
    renderWithUser();
    expect(await screen.findByText("124820")).toBeInTheDocument();
  });
  it("shows the positive test count", async () => {
    renderWithUser();
    expect(await screen.findByText("2270")).toBeInTheDocument();
  });
  it("shows the negative test count", async () => {
    renderWithUser();
    expect(await screen.findByText("122550")).toBeInTheDocument();
  });
  it("shows the positivity rate", async () => {
    renderWithUser();
    expect(await screen.findByText("1.8%")).toBeInTheDocument();
  });
  it("allows filtering by Lincoln Middle School", async () => {
    const { user } = renderWithUser();
    await screen.findByText("Central Schools - COVID-19 testing data");

    await user.selectOptions(screen.getByLabelText("Testing facility"), [
      "Lincoln Middle School",
    ]);
    expect(await screen.findByText("72341")).toBeInTheDocument();
    expect(await screen.findByText("1000")).toBeInTheDocument();
    expect(await screen.findByText("71341")).toBeInTheDocument();
    expect(await screen.findByText("1.4%")).toBeInTheDocument();
  });
  it("allows filtering by Rosa Parks High School", async () => {
    const { user } = renderWithUser();
    await screen.findByText("Central Schools - COVID-19 testing data");

    await user.selectOptions(screen.getByLabelText("Testing facility"), [
      "Rosa Parks High School",
    ]);
    expect(await screen.findByText("52479")).toBeInTheDocument();
    expect(await screen.findByText("1270")).toBeInTheDocument();
    expect(await screen.findByText("51209")).toBeInTheDocument();
    expect(await screen.findByText("2.4%")).toBeInTheDocument();
  });
  it("allows filtering by last day", async () => {
    const { user } = renderWithUser();
    await screen.findByText("Central Schools - COVID-19 testing data");

    await user.selectOptions(screen.getByLabelText("Date range"), [
      "Last day (24 hours)",
    ]);

    expect(await screen.findByText("120")).toBeInTheDocument();
    expect(await screen.findByText("11")).toBeInTheDocument();
    expect(await screen.findByText("109")).toBeInTheDocument();
    expect(await screen.findByText("9.2%")).toBeInTheDocument();
  });
  it("allows filtering by last week", async () => {
    const { user } = renderWithUser();
    await screen.findByText("Central Schools - COVID-19 testing data");

    await user.selectOptions(screen.getByLabelText("Date range"), [
      "Last week (7 days)",
    ]);

    expect(await screen.findByText("124820")).toBeInTheDocument();
  });
  it("allows filtering by last month", async () => {
    const { user } = renderWithUser();
    await screen.findByText("Central Schools - COVID-19 testing data");

    await user.selectOptions(screen.getByLabelText("Date range"), [
      "Last month (30 days)",
    ]);

    expect(await screen.findByText("623492")).toBeInTheDocument();
    expect(await screen.findByText("34971")).toBeInTheDocument();
    expect(await screen.findByText("588521")).toBeInTheDocument();
    expect(await screen.findByText("5.6%")).toBeInTheDocument();
  });
  it("allows filtering by a custom date range", async () => {
    const { user } = renderWithUser();
    await screen.findByText("Central Schools - COVID-19 testing data");

    await user.selectOptions(screen.getByLabelText("Date range"), [
      "Custom date range",
    ]);

    await screen.findByText("Central Schools - COVID-19 testing data");
    const startDate = screen.getByTestId("startDate") as HTMLInputElement;
    const endDate = screen.getByTestId("endDate") as HTMLInputElement;

    await user.clear(startDate);
    await user.type(startDate, "2021-07-01");
    await user.clear(endDate);
    await user.type(endDate, "2021-07-31");

    await screen.findByText(`All ${PATIENT_TERM_PLURAL} tested`);

    expect(await screen.findByText("14982")).toBeInTheDocument();
    expect(await screen.findByText("953")).toBeInTheDocument();
    expect(await screen.findByText("14029")).toBeInTheDocument();
    expect(await screen.findByText("6.4%")).toBeInTheDocument();
    expect(startDate.value).toEqual("2021-07-01");
    expect(endDate.value).toEqual("2021-07-31");
  });
  it("shows N/A for positivity rate at Empty School", async () => {
    const { user } = renderWithUser();
    await screen.findByText("Central Schools - COVID-19 testing data");

    await user.selectOptions(screen.getByLabelText("Testing facility"), [
      "Empty School",
    ]);

    expect(await screen.findByText("N/A")).toBeInTheDocument();
  });
  it("shows 0% for positivity rate at Empty School over last month", async () => {
    const { user } = renderWithUser();
    await screen.findByText("Central Schools - COVID-19 testing data");

    await user.selectOptions(screen.getByLabelText("Testing facility"), [
      "Empty School",
    ]);

    await screen.findByText("Empty School - COVID-19 testing data");

    await user.selectOptions(screen.getByLabelText("Date range"), [
      "Last month (30 days)",
    ]);

    expect(await screen.findByText("0.0%")).toBeInTheDocument();
  });
  it("allows selection of a different disease", async () => {
    const { user } = renderWithUser();
    await user.selectOptions(screen.getByLabelText("Condition"), ["Flu A"]);
    await screen.findByText("Central Schools - Flu A testing data");

    expect(await screen.findByText("736")).toBeInTheDocument();
    expect(await screen.findByText("289")).toBeInTheDocument();
    expect(await screen.findByText("447")).toBeInTheDocument();
    expect(await screen.findByText("39.3%")).toBeInTheDocument();
  });
  it("filters out HIV form dropdown", async () => {
    const flagSpy = jest.spyOn(flaggedMock, "useFeature");
    flagSpy.mockImplementation((flagName) => {
      return flagName !== "hivEnabled";
    });
    renderWithUser();
    const hivElement = screen.queryByText("HIV");
    expect(hivElement).not.toBeInTheDocument();
  });
  it("filters out syphilis from dropdown", async () => {
    const flagSpy = jest.spyOn(flaggedMock, "useFeature");
    flagSpy.mockImplementation((flagName) => {
      return flagName !== "syphilisEnabled";
    });

    renderWithUser();
    const syphilisElement = screen.queryByText("syphilis");
    expect(syphilisElement).not.toBeInTheDocument();
  });
});
