import { SeverityLevel } from "@microsoft/applicationinsights-web";
import { render } from "@testing-library/react";
import { MemoryRouter, useHistory } from "react-router-dom";
import { useEffect } from "react";

import TelemetryProvider from "./telemetry-provider";
import { ai, getAppInsights, withInsights } from "./TelemetryService";

jest.mock("@microsoft/applicationinsights-web", () => {
  return {
    ...jest.requireActual("@microsoft/applicationinsights-web"),
    ApplicationInsights: function () {
      return {
        loadAppInsights() {},
        trackTrace: jest.fn(),
        startTrackPage: jest.fn(),
      };
    },
  };
});

const oldEnv = process.env.REACT_APP_APPINSIGHTS_KEY;

describe("telemetry", () => {
  beforeEach(() => {
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(ai, "initialize");
  });
  afterEach(() => {
    jest.resetAllMocks();
    process.env.REACT_APP_APPINSIGHTS_KEY = oldEnv;
  });

  it("initializes the appInsights service", () => {
    process.env.REACT_APP_APPINSIGHTS_KEY = "fake-key";
    ai.initialize();
    expect(getAppInsights()).not.toBe(null);
  });

  it("calls app insights on console methods", () => {
    process.env.REACT_APP_APPINSIGHTS_KEY = "fake-key";
    const appInsights = getAppInsights();
    withInsights(console);
    const message = "hello there";
    console.log(message);
    expect(appInsights?.trackTrace).toBeCalledWith(
      {
        message,
        severityLevel: SeverityLevel.Information,
      },
      undefined
    );

    const warning = "some warning";
    const data = { oh: "no" };
    console.warn(warning, data);
    expect(appInsights?.trackTrace).toBeCalledWith(
      {
        message: warning,
        severityLevel: SeverityLevel.Warning,
      },
      { data: [data] }
    );
  });

  describe("Provider", () => {
    it("provides history object to appInsights", async () => {
      let history: ReturnType<typeof useHistory> | undefined = undefined;
      const GetHistory = () => {
        const h = useHistory();
        useEffect(() => {
          history = h;
        }, [h]);
        return <></>;
      };

      render(
        <MemoryRouter>
          <TelemetryProvider>
            <GetHistory />
          </TelemetryProvider>
        </MemoryRouter>
      );
      expect(ai.initialize).toBeCalledWith(history);
    });
  });
});
