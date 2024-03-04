import { MockedProvider } from "@apollo/client/testing";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import createMockStore from "redux-mock-store";

import {
  GetUploadSubmissionDocument,
  UploadStatus,
  UploadResult,
} from "../../../generated/graphql";

import Submission from "./Submission";

const mockStore = createMockStore([]);

const store = mockStore({
  organization: {
    name: "Central Schools",
  },
});

const submission: UploadResult = {
  internalId: "fake-id",
  reportId: "12b86a9d-a9d6-4391-a555-6618e8ac66d9",
  status: UploadStatus.Success,
  recordsCount: 2,
  createdAt: new Date("2022-05-05T13:47:09Z"),
  errors: [],
  warnings: [],
};

describe("Submission", () => {
  let mocks: any;
  let mockIsDone = false;

  beforeEach(() => {
    mocks = [
      {
        request: {
          query: GetUploadSubmissionDocument,
          variables: {
            id: submission.reportId,
          },
        },
        result: () => {
          mockIsDone = true;
          return {
            data: {
              uploadSubmission: submission,
            },
          };
        },
      },
    ];
  });

  const renderContainer = () =>
    render(
      <MockedProvider mocks={mocks}>
        <Provider store={store}>
          <MemoryRouter
            initialEntries={[
              "/results/upload/submissions/submission/12b86a9d-a9d6-4391-a555-6618e8ac66d9",
            ]}
          >
            <Routes>
              <Route
                path={"/results/upload/submissions/submission/:id"}
                element={<Submission />}
              ></Route>
            </Routes>
          </MemoryRouter>
        </Provider>
      </MockedProvider>
    );

  afterEach(() => {
    mockIsDone = false;
  });

  it("fetches upload submission details from GraphQL server", async () => {
    renderContainer();
    await waitFor(() => expect(mockIsDone).toBe(true));
  });

  it("renders the bulk test result upload submission view", async () => {
    renderContainer();
    expect(await screen.findByText("Report ID"));
    expect(await screen.findByText("12b86a9d-a9d6-4391-a555-6618e8ac66d9"));

    expect(await screen.findByText("Data stream"));
    expect(await screen.findByText("ELR"));

    expect(await screen.findByText("Transmission date"));
    expect(await screen.findByText("05/05/2022 1:47pm"));

    expect(await screen.findByText("Records"));
    expect(await screen.findByText("2"));
  });
});
