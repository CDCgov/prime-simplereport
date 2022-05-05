import { render, screen } from "@testing-library/react";
import createMockStore from "redux-mock-store";
import { MockedProvider } from "@apollo/client/testing";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";

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
          content: [
            {
              internalId: "e70c3110-15b7-43a1-9014-f07b81c5fce1",
              reportId: "e70c3110-15b7-43a1-9014-f07b81c5fce1",
              createdAt: "2022-05-05T13:47:09Z",
              status: "PENDING",
              recordsCount: "15",
              errors: null,
              warnings: null,
            },
            {
              internalId: "21bc0220-30d7-47a7-a22f-dfede0c04f19",
              reportId: "21bc0220-30d7-47a7-a22f-dfede0c04f19",
              createdAt: "2022-05-03T13:47:09Z",
              status: "SUCCESS",
              recordsCount: "15",
              errors: null,
              warnings: null,
            },
            {
              internalId: "1e0c8e80-52e9-4f80-9973-841ecebc297a",
              reportId: "1e0c8e80-52e9-4f80-9973-841ecebc297a",
              createdAt: "2022-05-02T13:47:09Z",
              status: "FAILURE",
              recordsCount: "15",
              errors: null,
              warnings: null,
            },
          ],
          totalElements: 3,
        } as UploadSubmissionPage,
      },
    },
  },
];

describe("Submissions", () => {
  it("should render loading screen", async () => {
    render(
      <MockedProvider>
        <Provider store={store}>
          <MemoryRouter>
            <Submissions />
          </MemoryRouter>
        </Provider>
      </MockedProvider>
    );

    expect(await screen.findByText("Loading …")).toBeInTheDocument();
  });

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

    expect(
      await screen.findByText("e70c3110-15b7-43a1-9014-f07b81c5fce1")
    ).toBeInTheDocument();
    expect(
      await screen.findByText("21bc0220-30d7-47a7-a22f-dfede0c04f19")
    ).toBeInTheDocument();
    expect(
      await screen.findByText("1e0c8e80-52e9-4f80-9973-841ecebc297a")
    ).toBeInTheDocument();
  });
});
