import {
  ApplicationInsights,
  ITelemetryItem,
  SeverityLevel,
} from "@microsoft/applicationinsights-web";
import { ReactPlugin } from "@microsoft/applicationinsights-react-js";

import {
  stripIdTokenFromOktaRedirectUri,
  stripIdTokenFromOperationName,
} from "./PrimeErrorBoundary";

let reactPlugin: ReactPlugin | null = null;
let appInsights: ApplicationInsights | null = null;

const createTelemetryService = () => {
  const initialize = () => {
    const connectionString =
      process.env.REACT_APP_APPLICATIONINSIGHTS_CONNECTION_STRING;

    if (!connectionString) {
      if (process.env.NODE_ENV !== "test") {
        console.warn("App Insights connection string not provided");
      }
      return;
    }

    reactPlugin = new ReactPlugin();

    appInsights = new ApplicationInsights({
      config: {
        connectionString,
        extensions: [reactPlugin],
        loggingLevelConsole: process.env.NODE_ENV === "development" ? 2 : 0,
        disableFetchTracking: false,
        enableAutoRouteTracking: true,
        loggingLevelTelemetry: 2,
        maxBatchInterval: 0,
      },
    });

    appInsights.addTelemetryInitializer(function (envelope: ITelemetryItem) {
      filterUnneededItems(envelope);
    });

    appInsights.loadAppInsights();
  };

  return { reactPlugin, appInsights, initialize };
};

export const ai = createTelemetryService();
export const getAppInsights = () => appInsights;

export function filterStaticFiles(envelope: ITelemetryItem) {
  try {
    const regexRemoteDependency =
      /Microsoft.ApplicationInsights.(.*).RemoteDependency/;

    const staticFilesToIgnore = [
      "GET /maintenance.json",
      "GET /app/static/commit.txt",
    ];

    if (
      regexRemoteDependency.test(envelope.name) &&
      staticFilesToIgnore.includes((envelope as any).baseData.name)
    ) {
      return false;
    }
  } catch (e) {
    /* do nothing and don't disrupt logging*/
  }
}

export function filterUnneededItems(envelope: ITelemetryItem) {
  const staticFileFound = filterStaticFiles(envelope) !== undefined;
  if (staticFileFound) return false;

  filterPotentialOktaRedirectEvent(envelope);
}

export function filterPotentialOktaRedirectEvent(envelope: ITelemetryItem) {
  // Okta redirects only come from page views events
  const eventIsPageView = envelope?.baseType === "PageviewData";
  if (!eventIsPageView) return true;

  const telemetryItem = envelope?.baseData;

  const telemetryItemNeedsIdSanitization =
    telemetryItem?.uri.includes("#id_token") ||
    envelope?.ext?.trace.name.includes("#id_token");

  if (
    telemetryItemNeedsIdSanitization &&
    telemetryItem?.uri &&
    envelope?.ext?.trace.name
  ) {
    const urlWithoutIdToken = stripIdTokenFromOktaRedirectUri(
      telemetryItem.uri
    );
    telemetryItem.uri = urlWithoutIdToken;

    // possible properties that need replacing
    if (telemetryItem?.properties?.refUri)
      telemetryItem.properties.refUri = urlWithoutIdToken;
    if (telemetryItem?.refURI) telemetryItem.refUri = urlWithoutIdToken;

    if (telemetryItem?.operation_Name) {
      telemetryItem.operation_Name = stripIdTokenFromOperationName(
        envelope!.ext!.trace.name
      );
    }
    return true;
  }
}

const logSeverityMap = {
  log: SeverityLevel.Information,
  warn: SeverityLevel.Warning,
  error: SeverityLevel.Error,
  info: SeverityLevel.Information,
} as const;

export function withInsights(console: Console) {
  const originalConsole = { ...console };

  Object.entries(logSeverityMap).forEach((el) => {
    const [method, severityLevel] = el as [
      keyof typeof logSeverityMap,
      SeverityLevel
    ];

    console[method] = (...data: any[]) => {
      originalConsole[method](...data);

      if (method === "error" || method === "warn") {
        let exception = data[0] instanceof Error ? data[0] : undefined;
        const id = (() => {
          let message = exception ? exception.message : data[0];
          if (typeof message === "string") {
            const messageNeedsSanitation = message.includes("#id_token");
            if (messageNeedsSanitation) {
              message = stripIdTokenFromOktaRedirectUri(message);
            }
          }
          if (exception) {
            exception = new Error(message);
            return message;
          }

          if (typeof data[0] === "string") {
            data[0] = message;
            return message;
          }
          const exceptionData = JSON.stringify(data[0]);
          return exceptionData;
        })();
        appInsights?.trackException({
          exception: exception,
          id,
          severityLevel,
          properties: {
            additionalInformation:
              data.length === 1 ? undefined : JSON.stringify(data.slice(1)),
          },
        });

        return;
      }

      const message =
        typeof data[0] === "string" ? data[0] : JSON.stringify(data[0]);
      appInsights?.trackEvent({
        name: `${method.toUpperCase()} - ${message}`,
        properties: {
          severityLevel,
          message,
          additionalInformation:
            data.length === 1 ? undefined : JSON.stringify(data.slice(1)),
        },
      });
    };
  });
}

export function getAppInsightsHeaders(): { [key: string]: string } {
  // x-ms-session-id is passed explicitly to the backend so we can correlate
  // backend operations with the frontend ones in App Insights
  return {
    "x-ms-session-id": getAppInsightsSessionId(),
  };
}

function getAppInsightsSessionId(): string {
  return appInsights?.context.getSessionId() ?? "";
}
