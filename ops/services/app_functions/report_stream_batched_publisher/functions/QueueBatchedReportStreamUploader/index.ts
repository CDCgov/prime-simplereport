import * as appInsights from "applicationinsights";
import { AzureFunction, Context } from "@azure/functions";
import fetch, { Headers } from "node-fetch";
import { ENV } from "./config";
import {
  convertToCsv,
  deleteSuccessfullyParsedMessages,
  dequeueMessages,
  getQueueClient,
  minimumMessagesAvailable,
  uploadResult,
} from "./lib";
import { ReportStreamResponse } from "./rs-response";

const { REPORT_STREAM_URL } = ENV;

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
  context.log(
    `Starting upload of ${parseSuccessCount} records to ReportStream`
  );

  const postResult = await uploadResult(csvPayload);

  telemetry.trackDependency({
    dependencyTypeName: "HTTP",
    name: "ReportStream",
    data: REPORT_STREAM_URL,
    properties: {
      recordCount: parseSuccessCount,
    },
    duration: new Date().getTime() - uploadStart,
    resultCode: postResult.status,
    success: postResult.ok,
    tagOverrides,
  });

  if (postResult.ok) {
    const response: ReportStreamResponse = await postResult.json();
    // TODO in 2363: push errors & warnings onto another queue

    context.log(
      `Upload to ${response.destinationCount} reporting destinations successful; deleting messages`
    );

    await deleteSuccessfullyParsedMessages(
      context,
      queueClient,
      messages,
      parseFailure
    );
  } else {
    const responseBody = await postResult.text();
    const errorText = `Failed to upload to ReportStream with response code ${postResult.status}`;
    context.log.error(
      `${errorText}. Response body (${responseBody.length} bytes): `,
      responseBody
    );
    telemetry.trackEvent({
      name: "ReportStream Upload Failed",
      properties: {
        status: postResult.status,
        responseBody,
      },
      tagOverrides,
    });
    throw new Error(errorText);
  }
};

export default QueueBatchedTestEventPublisher;
