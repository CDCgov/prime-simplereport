import { FetchMock, MockResponseInit } from "jest-fetch-mock/types";
import { render, screen } from "@testing-library/react";
import { useFeatures } from "flagged";

import WithFeatureFlags from "./WithFeatureFlags";

const backendUrl = process.env.REACT_APP_BACKEND_URL;
const appInsightsHeaders = {
  "x-ms-session-id": "",
};

describe("WithFeatureFlags Component", () => {
  const InnerComponent = (): JSX.Element => {
    const flags = useFeatures();
    return <p data-testid="inner-component">{JSON.stringify(flags)}</p>;
  };

  let mockLocalStorage: any = {};

  beforeAll(() => {
    global.Storage.prototype.setItem = jest.fn((key, value) => {
      mockLocalStorage[key] = value;
    });
    global.Storage.prototype.getItem = jest.fn((key) => mockLocalStorage[key]);
  });

  beforeEach(async () => {
    mockLocalStorage = {} as any;
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

  it("checks that renders children and inner component receives the flag", async () => {
    render(
      <WithFeatureFlags>
        <InnerComponent />
      </WithFeatureFlags>
    );
    expect(screen.getByTestId("inner-component")).toBeInTheDocument();
    await screen.findByText(/flag1/i);
  });

  it("checks that flags are retrieved from the endpoint and store in localStorage", async () => {
    render(
      <WithFeatureFlags>
        <InnerComponent />
      </WithFeatureFlags>
    );
    await screen.findByText(/flag1/i);
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

  it("checks that localStorage is being called during loading and after getting response from endpoint", async () => {
    render(
      <WithFeatureFlags>
        <InnerComponent />
      </WithFeatureFlags>
    );

    await screen.findByText(/flag1/i);
    expect(global.Storage.prototype.setItem).toHaveBeenCalledWith(
      "sr-app-features",
      '{"flag1":true}'
    );
    expect(global.Storage.prototype.getItem).toHaveBeenCalledWith(
      "sr-app-features"
    );
  });
});
