import * as appInsights from "applicationinsights";
import { AzureFunction, Context } from "@azure/functions";
import { ENV } from "../config";
import {
  convertToCsv,
  deleteSuccessfullyParsedMessages,
  dequeueMessages,
  getQueueClient,
  minimumMessagesAvailable,
  reportExceptions,
  uploadResult,
} from "./lib";
import { ReportStreamResponse } from "./rs-response";

const {
  REPORT_STREAM_URL,
  TEST_EVENT_QUEUE_NAME,
  REPORTING_EXCEPTION_QUEUE_NAME,
} = ENV;

appInsights.setup();
const telemetry = appInsights.defaultClient;

const QueueBatchedTestEventPublisher: AzureFunction = async function (
  context: Context
): Promise<void> {
  const tagOverrides = { "ai.operation.id": context.traceContext.traceparent };
  const publishingQueue = getQueueClient(TEST_EVENT_QUEUE_NAME);
  const exceptionQueue = getQueueClient(REPORTING_EXCEPTION_QUEUE_NAME);

  if (!(await minimumMessagesAvailable(context, publishingQueue))) {
    return;
  }

  const messages = await dequeueMessages(context, publishingQueue);
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

  if (parseSuccessCount < 1) {
    context.log(
      `Successfully parsed message count of ${parseSuccessCount} is less than 1; aborting`
    );
    return;
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
    const response: ReportStreamResponse =
      (await postResult.json()) as ReportStreamResponse;
    context.log(`Report Stream response: ${JSON.stringify(response)}`);
    await reportExceptions(context, exceptionQueue, response);

    context.log(
      `Upload to ${response.destinationCount} reporting destinations successful; deleting messages`
    );

    await deleteSuccessfullyParsedMessages(
      context,
      publishingQueue,
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
