import { FetchMock, MockResponseInit } from "jest-fetch-mock";

import { FeatureFlagsApiService } from "./FeatureFlagsApiService";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const appInsightsHeaders = {
  "x-ms-session-id": "",
};

describe("FeatureFlagsApiService", () => {
  beforeEach(async () => {
    (fetch as FetchMock).doMock();
    const mockRequest: MockResponseInit = {
      body: JSON.stringify({ flag1: true }),
      headers: { "content-type": "application/json" },
    };
    (fetch as FetchMock).mockResponseOnce(() => Promise.resolve(mockRequest));
  });

  afterEach(() => {
    (fetch as FetchMock).resetMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it("checks featureFlags request", () => {
    FeatureFlagsApiService.featureFlags();
    expect(fetch).toHaveBeenCalledWith(`${backendUrl}/feature-flags`, {
      body: undefined,
      headers: {
        Accept: "application/json, text/plain",
        "Content-Type": "application/json",
        ...appInsightsHeaders,
      },
      method: "GET",
      mode: "cors",
    });
  });
});
