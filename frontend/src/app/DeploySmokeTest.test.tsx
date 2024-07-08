import { render, screen, waitFor } from "@testing-library/react";
import { FetchMock } from "jest-fetch-mock";

import DeploySmokeTest, {
  APP_STATUS_FAILURE,
  APP_STATUS_LOADING,
  APP_STATUS_SUCCESS,
} from "./DeploySmokeTest";

describe("DeploySmokeTest", () => {
  beforeEach(() => {
    (fetch as FetchMock).resetMocks();
  });

  it("renders success when returned from the API endpoint", async () => {
    (fetch as FetchMock).mockResponseOnce(JSON.stringify({ status: "UP" }));
    (fetch as FetchMock).mockResponseOnce(
      JSON.stringify({ okta: "UP", status: "UP" })
    );

    render(<DeploySmokeTest />);
    await waitFor(() =>
      expect(screen.queryByText(APP_STATUS_LOADING)).not.toBeInTheDocument()
    );
    expect(screen.getByText(APP_STATUS_SUCCESS));
  });

  it("renders failure when returned from the API endpoint", async () => {
    (fetch as FetchMock).mockResponse(
      JSON.stringify({ okta: "UP", status: "DOWN" })
    );

    render(<DeploySmokeTest />);
    await waitFor(() =>
      expect(screen.queryByText(APP_STATUS_LOADING)).not.toBeInTheDocument()
    );
    expect(screen.getByText(APP_STATUS_FAILURE));
  });
});
