import {
  ApplicationInsights,
  SeverityLevel,
} from "@microsoft/applicationinsights-web";
import { ReactPlugin } from "@microsoft/applicationinsights-react-js";
import { useHistory } from "react-router";

let reactPlugin: ReactPlugin | null = null;
let appInsights: ApplicationInsights | null = null;
const instrumentationKey = process.env.REACT_APP_APPINSIGHTS_KEY;

const createTelemetryService = () => {
  const initialize = (browserHistory?: ReturnType<typeof useHistory>) => {
    if (!instrumentationKey) {
      return console.warn("Instrumentation key not provided in");
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
    decorateConsole();
  };

  return { reactPlugin, appInsights, initialize };
};

export const ai = createTelemetryService();
export const getAppInsights = () => appInsights;

const oldConsole = { ...console };

function decorateConsole() {
  /* eslint-disable-next-line */
  console = {
    ...oldConsole,
    ...consoleMethodsWithTelemetry,
  };
}

const logSeverityMap: Partial<Record<keyof Console, SeverityLevel>> = {
  log: SeverityLevel.Information,
  warn: SeverityLevel.Warning,
  error: SeverityLevel.Error,
  info: SeverityLevel.Information,
};

function consoleMethodsWithTelemetry() {
  return Object.entries(logSeverityMap).reduce((acc, el) => {
    const [method, severityLevel] = el as [
      keyof typeof logSeverityMap,
      SeverityLevel
    ];

    acc[method] = (...data: any[]) => {
      oldConsole[method](data);
      appInsights?.trackTrace(
        {
          message:
            typeof data[0] === "string" ? data[0] : JSON.stringify(data[0]),
          severityLevel,
        },
        { data }
      );
    };

    return acc;
  }, {} as Partial<Console>);
}
