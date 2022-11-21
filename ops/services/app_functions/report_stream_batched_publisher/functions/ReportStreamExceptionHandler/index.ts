import { AzureFunction, Context } from "@azure/functions";
import fetch, { Headers } from "node-fetch";
import { ENV } from "../config";
import { SimpleReportReportStreamResponse } from "../QueueBatchedReportStreamUploader/rs-response";

const { SIMPLE_REPORT_CB_TOKEN, SIMPLE_REPORT_CB_URL } = ENV;

const queueTrigger: AzureFunction = async function (
  context: Context,
  message: SimpleReportReportStreamResponse
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
    `Successfully processed exception for record ${message.testEventInternalId}`
  );
};

export default queueTrigger;
