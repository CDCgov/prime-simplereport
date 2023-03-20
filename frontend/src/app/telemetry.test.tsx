import {
  ITelemetryItem,
  SeverityLevel,
} from "@microsoft/applicationinsights-web";

import {
  ai,
  filterPotentialOktaRedirectEvent,
  filterStaticFiles,
  getAppInsights,
  withInsights,
} from "./TelemetryService";
import {
  stripIdTokenFromOktaRedirectUri,
  stripIdTokenFromOperationName,
} from "./PrimeErrorBoundary";

jest.mock("@microsoft/applicationinsights-web", () => {
  return {
    ...jest.requireActual("@microsoft/applicationinsights-web"),
    ApplicationInsights: function () {
      return {
        loadAppInsights() {},
        trackEvent: jest.fn(),
        trackException: jest.fn(),
        addTelemetryInitializer: jest.fn(),
      };
    },
  };
});

const oldEnv = process.env.REACT_APP_APPLICATIONINSIGHTS_CONNECTION_STRING;

describe("telemetry", () => {
  beforeEach(() => {
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(ai, "initialize");
  });
  afterEach(() => {
    jest.resetAllMocks();
    process.env.REACT_APP_APPLICATIONINSIGHTS_CONNECTION_STRING = oldEnv;
  });

  it("initializes the appInsights service", () => {
    process.env.REACT_APP_APPLICATIONINSIGHTS_CONNECTION_STRING =
      "fake-connection-string";
    ai.initialize();
    expect(getAppInsights()).not.toBe(null);
  });

  it("ignores static files", () => {
    const item = {
      name: "Microsoft.ApplicationInsights.mock.RemoteDependency",
      baseData: {
        name: "GET /maintenance.json",
      },
    } as ITelemetryItem;
    expect(filterStaticFiles(item)).toEqual(false);
  });

  it("correctly logs messages", () => {
    process.env.REACT_APP_APPLICATIONINSIGHTS_CONNECTION_STRING =
      "fake-connection-string";
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
  });

  it("scrubs tokens out of message exceptions", () => {
    process.env.REACT_APP_APPLICATIONINSIGHTS_CONNECTION_STRING =
      "fake-connection-string";
    const appInsights = getAppInsights();
    withInsights(console);

    const nonErrorErrorWithToken =
      "something something #id_token=blahblahblah&token_type=test";
    const errorStringWithoutToken = stripIdTokenFromOktaRedirectUri(
      nonErrorErrorWithToken
    );
    console.error(nonErrorErrorWithToken);
    expect(appInsights?.trackException).toBeCalledWith({
      exception: undefined,
      id: errorStringWithoutToken,
      severityLevel: SeverityLevel.Error,
      properties: {
        additionalInformation: undefined,
      },
    });

    const error = new Error(nonErrorErrorWithToken);
    const errorWithoutToken = new Error(errorStringWithoutToken);
    console.error(error);
    expect(appInsights?.trackException).toBeCalledWith({
      exception: errorWithoutToken,
      id: errorStringWithoutToken,
      severityLevel: SeverityLevel.Error,
      properties: {
        additionalInformation: undefined,
      },
    });
  });
});

describe("filter events on okta redirect", () => {
  it("skips items whose baseTypes aren't Pageviews", () => {
    const item = {
      baseType: "blah",
    } as ITelemetryItem;
    expect(filterPotentialOktaRedirectEvent(item)).toBe(true);
  });
  it("scrubs values with id token", () => {
    const urlWithToken = "localhost/#id_token=blahblahblah&token_type=test";
    const urlWithoutToken = stripIdTokenFromOktaRedirectUri(urlWithToken);

    const operationWithToken = "#id_token=blahblahblah&token_type=test";
    const operationWithoutToken =
      stripIdTokenFromOperationName(operationWithToken);

    const item = {
      name: "Microsoft.ApplicationInsights.mock.Pageview",
      baseData: {
        uri: urlWithToken,
        refUri: urlWithToken,
      },
      baseType: "PageviewData",
      ext: {
        trace: {
          name: operationWithToken,
        },
      },
    } as ITelemetryItem;
    const returnItem = filterPotentialOktaRedirectEvent(item) as ITelemetryItem;
    expect(returnItem?.ext?.trace?.name).toEqual(operationWithoutToken);
    expect(returnItem?.baseData?.uri).toEqual(urlWithoutToken);
    expect(returnItem?.baseData?.refUri).toEqual(urlWithoutToken);
  });
});
