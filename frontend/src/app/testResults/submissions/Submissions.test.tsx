import { render, screen } from "@testing-library/react";
import createMockStore from "redux-mock-store";
import { MockedProvider } from "@apollo/client/testing";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";

import {
  GetUploadSubmissionsDocument,
  UploadSubmissionPage,
} from "../../../generated/graphql";

import Submissions from "./Submissions";

const mockStore = createMockStore([]);
const store = mockStore({
  organization: {
    name: "Central Schools",
  },
  facilities: [{ id: "1", name: "Lincoln Middle School" }],
});

const getNoResultsMocks = () => [
  {
    request: {
      query: GetUploadSubmissionsDocument,
      variables: {
        pageSize: 10,
        pageNumber: 0,
        startDate: null,
        endDate: null,
      },
    },
    result: {
      data: {
        uploadSubmissions: {
          content: [],
          totalElements: 0,
        } as UploadSubmissionPage,
      },
    },
  },
];

const result_1 = {
  internalId: "internalId_1",
  reportId: "reportId_1",
  createdAt: "2020-05-05T13:47:09Z",
  status: "PENDING",
  recordsCount: 15,
  errors: [],
  warnings: [],
};
const result_2 = {
  internalId: "internalId_2",
  reportId: "reportId_2",
  createdAt: "2021-05-03T13:47:09Z",
  status: "SUCCESS",
  recordsCount: 15,
  errors: null,
  warnings: null,
};
const result_3 = {
  internalId: "internalId_3",
  reportId: "reportId_3",
  createdAt: "2022-05-02T13:47:09Z",
  status: "FAILURE",
  recordsCount: 15,
  errors: [],
  warnings: [],
};

const getMocks = () => [
  {
    request: {
      query: GetUploadSubmissionsDocument,
      variables: {
        pageSize: 10,
        pageNumber: 0,
        startDate: null,
        endDate: null,
      },
    },
    result: {
      data: {
        uploadSubmissions: {
          content: [result_1, result_2, result_3],
          totalElements: 3,
        } as UploadSubmissionPage,
      },
    },
  },
  {
    request: {
      query: GetUploadSubmissionsDocument,
      variables: {
        pageSize: 10,
        pageNumber: 0,
        startDate: "2021-01-01T00:00:00.000Z",
        endDate: null,
      },
    },
    result: {
      data: {
        uploadSubmissions: {
          content: [result_2, result_3],
          totalElements: 2,
        } as UploadSubmissionPage,
      },
    },
  },
  {
    request: {
      query: GetUploadSubmissionsDocument,
      variables: {
        pageSize: 10,
        pageNumber: 0,
        startDate: null,
        endDate: "2022-01-01T00:00:00.000Z",
      },
    },
    result: {
      data: {
        uploadSubmissions: {
          content: [result_2],
          totalElements: 1,
        } as UploadSubmissionPage,
      },
    },
  },
];

describe("Submissions", () => {
  it("should render no results", async () => {
    render(
      <MockedProvider mocks={getNoResultsMocks()}>
        <Provider store={store}>
          <MemoryRouter>
            <Submissions />
          </MemoryRouter>
        </Provider>
      </MockedProvider>
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(await screen.findByText("No results")).toBeInTheDocument();
  });

  it("should render submission results", async () => {
    render(
      <MockedProvider mocks={getMocks()}>
        <Provider store={store}>
          <MemoryRouter>
            <Submissions />
          </MemoryRouter>
        </Provider>
      </MockedProvider>
    );
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(await screen.findByText("reportId_1")).toBeInTheDocument();
    expect(await screen.findByText("reportId_2")).toBeInTheDocument();
    expect(await screen.findByText("reportId_3")).toBeInTheDocument();
  });

  it("should filter results when start date specified", async () => {
    render(
      <Provider store={store}>
        <MockedProvider mocks={getMocks()}>
          <MemoryRouter>
            <Submissions />
          </MemoryRouter>
        </MockedProvider>
      </Provider>
    );

    expect(await screen.findByText("reportId_1")).toBeInTheDocument();
    expect(await screen.findByText("reportId_2")).toBeInTheDocument();
    expect(await screen.findByText("reportId_3")).toBeInTheDocument();

    const startDateInput = screen.getAllByTestId(
      "date-picker-external-input"
    )[0];

    userEvent.type(startDateInput, "01/01/2021");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(screen.getByText("reportId_2")).toBeInTheDocument();
    expect(screen.getByText("reportId_3")).toBeInTheDocument();
    expect(screen.queryByText("reportId_1")).not.toBeInTheDocument();
  });

  it("should filter results when end date specified", async () => {
    render(
      <Provider store={store}>
        <MockedProvider mocks={getMocks()}>
          <MemoryRouter>
            <Submissions />
          </MemoryRouter>
        </MockedProvider>
      </Provider>
    );

    expect(await screen.findByText("reportId_1")).toBeInTheDocument();
    expect(await screen.findByText("reportId_2")).toBeInTheDocument();
    expect(await screen.findByText("reportId_3")).toBeInTheDocument();

    const endDateInput = screen.getAllByTestId("date-picker-external-input")[1];

    userEvent.type(endDateInput, "01/01/2022");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(screen.queryByText("reportId_1")).not.toBeInTheDocument();
    expect(screen.getByText("reportId_2")).toBeInTheDocument();
    expect(screen.queryByText("reportId_3")).not.toBeInTheDocument();
  });

  it("links to submission detail view", async () => {
    render(
      <Provider store={store}>
        <MockedProvider mocks={getMocks()}>
          <MemoryRouter>
            <Submissions />
          </MemoryRouter>
        </MockedProvider>
      </Provider>
    );

    await new Promise((resolve) => setTimeout(resolve, 0));

    [result_1, result_2, result_3].forEach((result) => {
      expect(screen.getByText(result.reportId).closest("a")).toHaveAttribute(
        "href",
        `/results/upload/submissions/submission/${result.internalId}`
      );
    });
  });
});
