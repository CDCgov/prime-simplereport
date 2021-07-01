import { SeverityLevel } from "@microsoft/applicationinsights-web";

import { ai, getAppInsights, withInsights } from "./TelemetryService";

jest.mock("@microsoft/applicationinsights-web", () => {
  return {
    ...jest.requireActual("@microsoft/applicationinsights-web"),
    ApplicationInsights: function () {
      return {
        loadAppInsights() {},
        trackTrace: jest.fn(),
      };
    },
  };
});

const oldEnv = process.env.REACT_APP_APPINSIGHTS_KEY;

describe("telemetry", () => {
  beforeEach(() => {
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});
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
});
