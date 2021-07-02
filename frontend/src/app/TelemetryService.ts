import {
  ApplicationInsights,
  SeverityLevel,
} from "@microsoft/applicationinsights-web";
import { ReactPlugin } from "@microsoft/applicationinsights-react-js";
import { useHistory } from "react-router";

let reactPlugin: ReactPlugin | null = null;
let appInsights: ApplicationInsights | null = null;

const createTelemetryService = () => {
  const initialize = (browserHistory?: ReturnType<typeof useHistory>) => {
    const instrumentationKey = process.env.REACT_APP_APPINSIGHTS_KEY;

    if (!instrumentationKey) {
      console.warn("Instrumentation key not provided");
      return;
    }

    reactPlugin = new ReactPlugin();

    appInsights = new ApplicationInsights({
      config: {
        instrumentationKey,
        extensions: [reactPlugin],
        loggingLevelConsole: 2,
        disableFetchTracking: false,
        enableAutoRouteTracking: true,
        loggingLevelTelemetry: 2,
        maxBatchInterval: 0,
        extensionConfig: browserHistory
          ? {
              [reactPlugin.identifier]: { history: browserHistory },
            }
          : undefined,
      },
    });

    appInsights.loadAppInsights();
  };

  return { reactPlugin, appInsights, initialize };
};

export const ai = createTelemetryService();
export const getAppInsights = () => appInsights;

const logSeverityMap: Partial<Record<keyof Console, SeverityLevel>> = {
  log: SeverityLevel.Information,
  warn: SeverityLevel.Warning,
  error: SeverityLevel.Error,
  info: SeverityLevel.Information,
};

const telemetryFailure = /failed to send telemetry/i;

export function withInsights(console: Console) {
  const originalConsole = { ...console };

  Object.entries(logSeverityMap).forEach((el) => {
    const [method, severityLevel] = el as [
      keyof typeof logSeverityMap,
      SeverityLevel
    ];

    console[method] = (...data: any[]) => {
      originalConsole[method](data);

      // Prevent telemetry failure infinite loop
      if (telemetryFailure.test(data[0])) {
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
