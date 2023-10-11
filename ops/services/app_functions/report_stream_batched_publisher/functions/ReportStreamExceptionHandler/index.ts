import { app, InvocationContext } from "@azure/functions";
import fetch, { Headers } from "node-fetch";
import { ENV } from "../config";
import { ReportStreamCallbackRequest } from "../common/types";

const { SIMPLE_REPORT_CB_TOKEN, SIMPLE_REPORT_CB_URL } = ENV;

export async function queueTrigger(
  message: ReportStreamCallbackRequest,
  context: InvocationContext,
): Promise<void> {
  const headers = new Headers({
    Accept: "application/json",
    "Content-Type": "application/json",
    "x-functions-key": SIMPLE_REPORT_CB_TOKEN,
  });
  const result = await fetch(SIMPLE_REPORT_CB_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(message),
  });
  if (!result.ok) {
    throw new Error(`${result.status}: ${await result.text()}`);
  }
  context.log(
    `Successfully processed exception for record ${message.testEventInternalId} from queue ${message.queueName}`,
  );
}

//export default queueTrigger;
app.storageQueue("body", {
  queueName: "test-event-publishing-exceptions",
  connection: "AZ_STORAGE_QUEUE_CXN_STRING",
  handler: queueTrigger,
});
