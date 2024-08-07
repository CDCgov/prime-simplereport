import { render, screen, waitFor } from "@testing-library/react";
import { FetchMock } from "jest-fetch-mock";

import DeploySmokeTest, {
  APP_STATUS_FAILURE,
  APP_STATUS_LOADING,
  APP_STATUS_SUCCESS,
  OKTA_STATUS_LOADING,
  OKTA_STATUS_SUCCESS,
} from "./DeploySmokeTest";
import { generateBackendApiHealthResponse } from "./deploySmokeTestTestConstants";

describe("DeploySmokeTest", () => {
  beforeEach(() => {
    (fetch as FetchMock).resetMocks();
  });

  it("renders success when returned from the backend API smoke test endpoint", async () => {
    (fetch as FetchMock).mockResponseOnce(JSON.stringify({ status: "UP" }));
    (fetch as FetchMock).mockResponseOnce(JSON.stringify({ status: "DOWN" }));

    render(<DeploySmokeTest />);
    await waitFor(() =>
      expect(screen.queryByText(APP_STATUS_LOADING)).not.toBeInTheDocument()
    );
    expect(screen.getByText(APP_STATUS_SUCCESS));
  });

  it("renders failure when returned from the backend API smoke test endpoint", async () => {
    (fetch as FetchMock).mockResponse(JSON.stringify({ status: "DOWN" }));

    render(<DeploySmokeTest />);
    await waitFor(() =>
      expect(screen.queryByText(APP_STATUS_LOADING)).not.toBeInTheDocument()
    );
    expect(screen.getByText(APP_STATUS_FAILURE));
  });

  it("renders Okta success when returned from the backend API health endpoint", async () => {
    (fetch as FetchMock).mockResponse(
      JSON.stringify(generateBackendApiHealthResponse())
    );

    render(<DeploySmokeTest />);
    await waitFor(() =>
      expect(screen.queryByText(OKTA_STATUS_LOADING)).not.toBeInTheDocument()
    );
    expect(screen.getByText(OKTA_STATUS_SUCCESS));
  });
});
