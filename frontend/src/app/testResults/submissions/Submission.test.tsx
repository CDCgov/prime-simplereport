import { MockedProvider } from "@apollo/client/testing";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
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
  reportId: "12b86a9d-a9d6-4391-a555-6618e8ac66d9",
  status: UploadStatus.Success,
  recordsCount: 2,
  createdAt: "2022-05-05T13:47:09Z",
  errors: "[]",
  warnings: "[]",
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

  afterEach(() => {
    mockIsDone = false;
  });

  it("fetches upload submission details from GraphQL server", async () => {
    render(
      <MockedProvider mocks={mocks}>
        <Provider store={store}>
          <Submission reportId={submission.reportId} />
        </Provider>
      </MockedProvider>
    );

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(mockIsDone).toBe(true);
  });

  it("renders the bulk test result upload submission view", async () => {
    render(
      <MockedProvider mocks={mocks}>
        <Provider store={store}>
          <Submission reportId={submission.reportId} />
        </Provider>
      </MockedProvider>
    );

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(await screen.findByText("05 May 2022 13:47"));

    expect(await screen.findByText("Report ID"));
    expect(await screen.findByText(submission.reportId));

    expect(await screen.findByText("Data Stream"));
    expect(await screen.findByText("ELR"));

    expect(await screen.findByText("Transmission Date"));
    expect(await screen.findByText("05 May 2022"));

    expect(await screen.findByText("Transmission Time"));
    expect(await screen.findByText("13:47"));

    expect(await screen.findByText("Records"));
    expect(await screen.findByText("2"));
  });
});
