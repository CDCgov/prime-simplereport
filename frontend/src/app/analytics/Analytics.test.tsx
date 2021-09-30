import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react-dom/test-utils";
import { MockedProvider } from "@apollo/client/testing";
import createMockStore from "redux-mock-store";
import { Provider } from "react-redux";

import { GetTopLevelDashboardMetricsDocument } from "../../generated/graphql";

import {
  Analytics,
  getDateFromDaysAgo,
  getDateWithCurrentTimeFromString,
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
  jest.useFakeTimers("modern").setSystemTime(new Date("2021-08-01").getTime());
});

const getMocks = () => [
  {
    request: {
      query: GetTopLevelDashboardMetricsDocument,
      variables: {
        facilityId: "",
        startDate: getDateFromDaysAgo(7),
        endDate: new Date(),
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
      query: GetTopLevelDashboardMetricsDocument,
      variables: {
        facilityId: "",
        startDate: getDateFromDaysAgo(1),
        endDate: new Date(),
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
      query: GetTopLevelDashboardMetricsDocument,
      variables: {
        facilityId: "",
        startDate: getDateFromDaysAgo(30),
        endDate: new Date(),
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
      query: GetTopLevelDashboardMetricsDocument,
      variables: {
        facilityId: "1",
        startDate: getDateFromDaysAgo(7),
        endDate: new Date(),
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
      query: GetTopLevelDashboardMetricsDocument,
      variables: {
        facilityId: "2",
        startDate: getDateFromDaysAgo(7),
        endDate: new Date(),
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
      query: GetTopLevelDashboardMetricsDocument,
      variables: {
        facilityId: "",
        startDate: getDateWithCurrentTimeFromString("07/01/2021"),
        endDate: getDateWithCurrentTimeFromString("07/31/2021"),
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
      query: GetTopLevelDashboardMetricsDocument,
      variables: {
        facilityId: "",
        startDate: getDateWithCurrentTimeFromString("07/01/2021"),
        endDate: new Date(),
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
      query: GetTopLevelDashboardMetricsDocument,
      variables: {
        facilityId: "3",
        startDate: getDateFromDaysAgo(7),
        endDate: new Date(),
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
];

describe("Analytics", () => {
  beforeEach(() => {
    jest
      .useFakeTimers("modern")
      .setSystemTime(new Date("2021-08-01").getTime());
    render(
      <MockedProvider mocks={getMocks()}>
        <Provider store={store}>
          <Analytics />
        </Provider>
      </MockedProvider>
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders", async () => {
    expect(
      await screen.findByText("COVID-19 testing data")
    ).toBeInTheDocument();
  });
  it("shows the total test count", async () => {
    expect(await screen.findByText("124820")).toBeInTheDocument();
  });
  it("shows the positive test count", async () => {
    expect(await screen.findByText("2270")).toBeInTheDocument();
  });
  it("shows the negative test count", async () => {
    expect(await screen.findByText("122550")).toBeInTheDocument();
  });
  it("shows the positivity rate", async () => {
    expect(await screen.findByText("1.8%")).toBeInTheDocument();
  });
  it("allows filtering by Lincoln Middle School", async () => {
    await act(async () => {
      await screen.findByText("COVID-19 testing data");
      userEvent.selectOptions(screen.getByLabelText("Testing facility"), [
        "Lincoln Middle School",
      ]);
    });
    expect(await screen.findByText("72341")).toBeInTheDocument();
    expect(await screen.findByText("1000")).toBeInTheDocument();
    expect(await screen.findByText("71341")).toBeInTheDocument();
    expect(await screen.findByText("1.4%")).toBeInTheDocument();
  });
  it("allows filtering by Rosa Parks High School", async () => {
    await act(async () => {
      await screen.findByText("COVID-19 testing data");
      userEvent.selectOptions(screen.getByLabelText("Testing facility"), [
        "Rosa Parks High School",
      ]);
    });
    expect(await screen.findByText("52479")).toBeInTheDocument();
    expect(await screen.findByText("1270")).toBeInTheDocument();
    expect(await screen.findByText("51209")).toBeInTheDocument();
    expect(await screen.findByText("2.4%")).toBeInTheDocument();
  });
  it("allows filtering by last day", async () => {
    await act(async () => {
      await screen.findByText("COVID-19 testing data");
      userEvent.selectOptions(screen.getByLabelText("Date range"), [
        "Last day (24 hours)",
      ]);
    });
    expect(await screen.findByText("120")).toBeInTheDocument();
    expect(await screen.findByText("11")).toBeInTheDocument();
    expect(await screen.findByText("109")).toBeInTheDocument();
    expect(await screen.findByText("9.2%")).toBeInTheDocument();
  });
  it("allows filtering by last week", async () => {
    await act(async () => {
      await screen.findByText("COVID-19 testing data");
      userEvent.selectOptions(screen.getByLabelText("Date range"), [
        "Last week (7 days)",
      ]);
    });
    expect(await screen.findByText("124820")).toBeInTheDocument();
  });
  it("allows filtering by last month", async () => {
    await act(async () => {
      await screen.findByText("COVID-19 testing data");
      userEvent.selectOptions(screen.getByLabelText("Date range"), [
        "Last month (30 days)",
      ]);
    });
    expect(await screen.findByText("623492")).toBeInTheDocument();
    expect(await screen.findByText("34971")).toBeInTheDocument();
    expect(await screen.findByText("588521")).toBeInTheDocument();
    expect(await screen.findByText("5.6%")).toBeInTheDocument();
  });
  it("allows filtering by a custom date range", async () => {
    await act(async () => {
      await screen.findByText("COVID-19 testing data");
      userEvent.selectOptions(screen.getByLabelText("Date range"), [
        "Custom date range",
      ]);
      await screen.findByText("COVID-19 testing data");
      await userEvent.type(
        screen.getAllByTestId("date-picker-external-input")[0],
        "07/01/2021"
      );
      await screen.findByText("COVID-19 testing data");
      await userEvent.type(
        screen.getAllByTestId("date-picker-external-input")[1],
        "07/31/2021"
      );
    });
    expect(await screen.findByText("14982")).toBeInTheDocument();
    expect(await screen.findByText("953")).toBeInTheDocument();
    expect(await screen.findByText("14029")).toBeInTheDocument();
    expect(await screen.findByText("6.4%")).toBeInTheDocument();
  });
  it("shows N/A for positivity rate at Empty School", async () => {
    await act(async () => {
      await screen.findByText("COVID-19 testing data");
      userEvent.selectOptions(screen.getByLabelText("Testing facility"), [
        "Empty School",
      ]);
    });
    expect(await screen.findByText("N/A")).toBeInTheDocument();
  });
});
