// AppInsights.js
import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import { ReactPlugin } from "@microsoft/applicationinsights-react-js";
import { createBrowserHistory } from "history";

const browserHistory = createBrowserHistory({ basename: "" });
const reactPlugin = new ReactPlugin();
const appInsights =
  process.env.NODE_ENV === "production"
    ? new ApplicationInsights({
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
      })
    : undefined;
appInsights?.loadAppInsights();

export { appInsights, reactPlugin };
