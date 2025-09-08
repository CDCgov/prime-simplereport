import * as appInsights from "applicationinsights";

let initialized = false;

export function getTelemetry() {
  if (!initialized) {
    appInsights.setup().start();
    initialized = true;
  }

  const client = appInsights.defaultClient;
  if (!client) {
    throw new Error("Application Insights client failed to initialize");
  }

  return client;
}
