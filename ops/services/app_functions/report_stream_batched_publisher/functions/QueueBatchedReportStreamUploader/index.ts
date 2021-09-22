import * as appInsights from "applicationinsights";
import { AzureFunction, Context } from "@azure/functions";
import {
  QueueServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-queue";
import fetch, { Headers } from "node-fetch";
import { ENV } from "./config";
import {
  convertToCsv,
  deleteSuccessfullyParsedMessages,
  dequeueMessages,
  getQueueClient,
  minimumMessagesAvailable,
} from "./lib";
import { ReportStreamResponse } from "./rs-response";

const {
  REPORT_STREAM_URL,
  REPORT_STREAM_TOKEN,
} = ENV;

const uploaderVersion = "2021-08-17";

appInsights.setup();
const telemetry = appInsights.defaultClient;

const QueueBatchedTestEventPublisher: AzureFunction = async function (
  context: Context,
  myTimer: any
): Promise<void> {
  const tagOverrides = { "ai.operation.id": context.traceContext.traceparent };
  const queueClient = getQueueClient();

  if (!(await minimumMessagesAvailable(context, queueClient))) {
    return;
  }

  const messages = await dequeueMessages(context, queueClient);
  telemetry.trackEvent({
    name: "Messages Dequeued",
    properties: { messagesDequeued: messages.length },
    tagOverrides,
  });

  const { csvPayload, parseFailure, parseFailureCount, parseSuccessCount } =
    convertToCsv(messages);

  if (parseFailureCount > 0) {
    telemetry.trackEvent({
      name: "Test Event Parse Failure",
      properties: {
        count: parseFailureCount,
        parseFailures: Object.keys(parseFailure),
      },
      tagOverrides,
    });
  }

  const uploadStart = new Date().getTime();
  context.log(`Starting upload of ${parseSuccessCount} records to ReportStream`);

  const headers = new Headers({
    "x-functions-key": REPORT_STREAM_TOKEN,
    "x-api-version": uploaderVersion,
    "content-type": "text/csv",
    client: "simple_report",
  });
  const postResult = await fetch(REPORT_STREAM_URL, {
    method: "POST",
    headers,
    body: csvPayload,
  });

  telemetry.trackDependency({
    dependencyTypeName: "HTTP",
    name: "ReportStream",
    data: REPORT_STREAM_URL,
    properties: {
      recordCount: parseSuccessCount
    },
    duration: new Date().getTime() - uploadStart,
    resultCode: postResult.status,
    success: postResult.ok,
    tagOverrides
  });

  if (postResult.ok) {
    const response: ReportStreamResponse = await postResult.json();
    // TODO: interpret errors & warnings

    context.log(
      `Upload to ${response.destinationCount} reporting destinations successful; deleting messages`
    );
    // TODO: integrate w/ AppInsights ?

    await deleteSuccessfullyParsedMessages(
      context,
      queueClient,
      messages,
      parseFailure
    );
  } else {
    const responseBody = await postResult.text();
    context.log.error(
      `Upload to ReportStream failed with error code ${postResult.status}. Response body (${postResult.size}b): `, responseBody
    );
    telemetry.trackEvent({
      name: "ReportStream Upload Failed",
      properties: { 
        status: postResult.status,
        responseBody
      },
      tagOverrides,
    });
  }
};

export default QueueBatchedTestEventPublisher;
