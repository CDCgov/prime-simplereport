import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react-dom/test-utils";
import { MockedProvider } from "@apollo/client/testing";
import createMockStore from "redux-mock-store";
import { Provider } from "react-redux";
import moment from "moment";

import { GetTopLevelDashboardMetricsDocument } from "../../generated/graphql";

import { Analytics, EXTERNAL_DATE_FORMAT } from "./Analytics";

const mockStore = createMockStore([]);

const store = mockStore({
  organization: {
    name: "Central Schools",
  },
  facilities: [
    { id: "1", name: "Lincoln Middle School" },
    { id: "2", name: "Rosa Parks High School" },
  ],
});

const now = moment();
const today = now.format(EXTERNAL_DATE_FORMAT);

const topLevelDashboardMetricsMockQueries = [
  {
    request: {
      query: GetTopLevelDashboardMetricsDocument,
      variables: {
        facilityId: "",
        startDate: moment(today, EXTERNAL_DATE_FORMAT)
          .subtract(7, "day")
          .hour(now.hours())
          .minute(now.minutes())
          .toDate(),
        endDate: moment(today, EXTERNAL_DATE_FORMAT)
          .hour(now.hours())
          .minute(now.minutes())
          .toDate(),
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
        startDate: moment(today, EXTERNAL_DATE_FORMAT)
          .subtract(30, "day")
          .hour(now.hours())
          .minute(now.minutes())
          .toDate(),
        endDate: moment(today, EXTERNAL_DATE_FORMAT)
          .hour(now.hours())
          .minute(now.minutes())
          .toDate(),
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
        startDate: moment(today, EXTERNAL_DATE_FORMAT)
          .subtract(7, "day")
          .hour(now.hours())
          .minute(now.minutes())
          .toDate(),
        endDate: moment(today, EXTERNAL_DATE_FORMAT)
          .hour(now.hours())
          .minute(now.minutes())
          .toDate(),
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
        startDate: moment(today, EXTERNAL_DATE_FORMAT)
          .subtract(7, "day")
          .hour(now.hours())
          .minute(now.minutes())
          .toDate(),
        endDate: moment(today, EXTERNAL_DATE_FORMAT)
          .hour(now.hours())
          .minute(now.minutes())
          .toDate(),
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
];

describe("Analytics", () => {
  beforeEach(() => {
    render(
      <MockedProvider mocks={topLevelDashboardMetricsMockQueries}>
        <Provider store={store}>
          <Analytics />
        </Provider>
      </MockedProvider>
    );
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
      userEvent.selectOptions(screen.getByLabelText("Facility"), [
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
      userEvent.selectOptions(screen.getByLabelText("Facility"), [
        "Rosa Parks High School",
      ]);
    });
    expect(await screen.findByText("52479")).toBeInTheDocument();
    expect(await screen.findByText("1270")).toBeInTheDocument();
    expect(await screen.findByText("51209")).toBeInTheDocument();
    expect(await screen.findByText("2.4%")).toBeInTheDocument();
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
});
