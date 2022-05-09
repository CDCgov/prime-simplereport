import { MockedProvider } from "@apollo/client/testing";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import createMockStore from "redux-mock-store";

import {
  GetUploadSubmissionDocument,
  UploadStatus,
  UploadSubmission,
} from "../../../generated/graphql";

import Submission from "./Submission";

const mockStore = createMockStore([]);

const store = mockStore({
  organization: {
    name: "Central Schools",
  },
});

const submission: UploadSubmission = {
  reportId: "12b86a9d-a9d6-4391-a555-6618e8ac66d9",
  internalId: "barfoo",
  status: UploadStatus.Success,
  recordsCount: "2",
  createdAt: 1652129265573,
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
          <Submission />
        </Provider>
      </MockedProvider>
    );

    expect(mockIsDone).toBe(true);
  });

  it("renders the bulk test result upload submission view", async () => {
    render(
      <MockedProvider mocks={mocks}>
        <Provider store={store}>
          <Submission />
        </Provider>
      </MockedProvider>
    );

    expect(await screen.findByText("09 May 2022 16:48"));

    expect(await screen.findByText("Report ID"));
    expect(await screen.findByText(submission.reportId));

    expect(await screen.findByText("Data Stream"));
    expect(await screen.findByText("ELR"));

    expect(await screen.findByText("Transmission Date"));
    expect(await screen.findByText("09 May 2022"));

    expect(await screen.findByText("Transmission Time"));
    expect(await screen.findByText("16:48"));

    expect(await screen.findByText("Records"));
    expect(await screen.findByText("2"));
  });
});
