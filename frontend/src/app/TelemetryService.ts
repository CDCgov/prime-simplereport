import { ApplicationInsights } from "@microsoft/applicationinsights-web";
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
  };

  return { reactPlugin, appInsights, initialize };
};

export const ai = createTelemetryService();
export const getAppInsights = () => appInsights;
