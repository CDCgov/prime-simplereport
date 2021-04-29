// AppInsights.js
import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import { ReactPlugin } from "@microsoft/applicationinsights-react-js";
import { createBrowserHistory } from "history";

const browserHistory = createBrowserHistory({ basename: "" });
const reactPlugin = new ReactPlugin();
const appInsights = new ApplicationInsights({
  config: {
    instrumentationKey: process.env.REACT_APP_APPINSIGHTS_KEY,
    extensions: [reactPlugin],
    loggingLevelConsole: 2,
    disableFetchTracking: false,
    enableAutoRouteTracking: true,
    loggingLevelTelemetry: 2,
    maxBatchInterval: 0,
    extensionConfig: {
      [reactPlugin.identifier]: { history: browserHistory },
    },
  },
});

if (process.env.REACT_APP_APPINSIGHTS_KEY) {
  appInsights.loadAppInsights();
} else {
  console.info("Application Insights key was not found.");
}

export { appInsights, reactPlugin };
