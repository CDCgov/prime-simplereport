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
        trackEvent: jest.fn(),
        trackException: jest.fn(),
      };
    },
  };
});

const oldEnv = process.env.REACT_APP_APPINSIGHTS_KEY;

describe("telemetry", () => {
  beforeEach(() => {
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
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
    expect(appInsights?.trackEvent).toBeCalledWith({
      name: "LOG - hello there",
      properties: {
        severityLevel: SeverityLevel.Information,
        message,
        additionalInformation: undefined,
      },
    });

    const warning = "some warning";
    const data = { oh: "no" };
    console.warn(warning, data);
    expect(appInsights?.trackException).toBeCalledWith({
      id: "some warning",
      severityLevel: SeverityLevel.Warning,
      properties: {
        additionalInformation: JSON.stringify([data]),
      },
    });

    const error = new Error("bad news");
    console.error(error);
    expect(appInsights?.trackException).toBeCalledWith({
      exception: error,
      id: error.message,
      severityLevel: SeverityLevel.Error,
      properties: {
        additionalInformation: undefined,
      },
    });

    const nonErrorError = "something bad happened";
    console.error(nonErrorError);
    expect(appInsights?.trackException).toBeCalledWith({
      exception: undefined,
      id: nonErrorError,
      severityLevel: SeverityLevel.Error,
      properties: {
        additionalInformation: undefined,
      },
    });
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
