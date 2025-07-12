import * as appInsights from "applicationinsights";
import { app, InvocationContext, Timer } from "@azure/functions";

appInsights.setup();
const telemetry = appInsights.defaultClient;

export async function SendToAIMS(
  _myTimer: Timer,
  context: InvocationContext,
): Promise<void> {
  const operationId = context.traceContext.traceParent;

  telemetry.trackEvent({
    name: `Executing SendToAIMS function`,
    properties: {
      operationId,
    },
  });

  context.log("Sent a telemetry event");
}

app.timer("SendToAIMS", {
  schedule: "0 */5 * * * *",
  handler: SendToAIMS,
});
