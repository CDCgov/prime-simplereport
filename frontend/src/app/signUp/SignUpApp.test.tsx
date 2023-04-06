import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import * as AppInsightsMock from "../TelemetryService";

import SignUpApp from "./SignUpApp";

describe("SignUpApp", () => {
  const trackMetricMock = jest.fn();
  const getAppInsightsSpy = jest.spyOn(AppInsightsMock, "getAppInsights");
  beforeEach(() => {
    Object.defineProperty(global, "visualViewport", {
      value: { width: 1200, height: 800 },
    });

    getAppInsightsSpy.mockImplementation(
      () => ({ trackMetric: trackMetricMock } as jest.MockedObject<any>)
    );

    render(
      <MemoryRouter>
        <SignUpApp />
      </MemoryRouter>
    );
  });

  afterEach(() => {
    getAppInsightsSpy.mockRestore();
  });

  it("renders and logs metrics", async () => {
    expect(screen.getByText("Sign up for SimpleReport")).toBeInTheDocument();
    await waitFor(() =>
      expect(trackMetricMock).toHaveBeenCalledWith(
        {
          name: "userViewport_signUp",
          average: 1200,
        },
        {
          width: 1200,
          height: 800,
        }
      )
    );
  });
});
