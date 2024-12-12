import {
  ApplicationInsights,
  ITelemetryItem,
  SeverityLevel,
} from "@microsoft/applicationinsights-web";
import { ReactPlugin } from "@microsoft/applicationinsights-react-js";

import {
  stripIdTokenFromOktaRedirectUri,
  stripIdTokenFromOperationName,
} from "./utils/url";

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
      if (isStaticFileToSkip(envelope)) return false; //skips logging when returning false
      // for all remaining logs
      sanitizeOktaToken(envelope);
    });

    appInsights.loadAppInsights();
  };

  return { reactPlugin, appInsights, initialize };
};

export const ai = createTelemetryService();
export const getAppInsights = () => appInsights;

export function isStaticFileToSkip(envelope: ITelemetryItem) {
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
      return true; // file should be skipped
    }
  } catch {
    /* do nothing and don't disrupt logging*/
  }
}

const setAdditionalInfo = (data: any[]) => {
  return data.length === 1 ? undefined : JSON.stringify(data.slice(1));
};

const setMessage = (data: any[]) => {
  return typeof data[0] === "string" ? data[0] : JSON.stringify(data[0]);
};

const setException = (data: any[]) => {
  return data[0] instanceof Error ? data[0] : undefined;
};

const setExceptionMessage = (exception: Error | undefined, data: any[]) => {
  return exception ? exception.message : data[0];
};

export function sanitizeOktaToken(envelope: ITelemetryItem): void {
  try {
    // Okta redirects only come from page views events
    const eventIsPageView = envelope?.baseType === "PageviewData";
    if (!eventIsPageView) return;

    const telemetryItem = envelope?.baseData;

    const telemetryItemNeedsIdSanitization =
      telemetryItem?.uri.includes("#id_token");

    if (
      telemetryItemNeedsIdSanitization &&
      telemetryItem?.refUri &&
      envelope?.ext?.trace.name
    ) {
      // possible properties that need replacing
      const urlWithoutIdToken = stripIdTokenFromOktaRedirectUri(
        telemetryItem.uri
      );
      telemetryItem.uri = urlWithoutIdToken;
      telemetryItem.refUri = urlWithoutIdToken;

      envelope.ext.trace.name = stripIdTokenFromOperationName(
        envelope.ext.trace.name
      );
    }
  } catch {
    /* do nothing and don't disrupt logging*/
  }
  return;
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
        let exception = setException(data);
        const id = (() => {
          let message = setExceptionMessage(exception, data);
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
          return JSON.stringify(data[0]);
        })();
        appInsights?.trackException({
          exception: exception,
          id,
          severityLevel,
          properties: {
            additionalInformation: setAdditionalInfo(data),
          },
        });

        return;
      }

      const message = setMessage(data);
      appInsights?.trackEvent({
        name: `${method.toUpperCase()} - ${message}`,
        properties: {
          severityLevel,
          message,
          additionalInformation: setAdditionalInfo(data),
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
