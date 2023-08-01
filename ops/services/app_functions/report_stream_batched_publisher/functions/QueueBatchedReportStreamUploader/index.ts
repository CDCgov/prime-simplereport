import * as appInsights from "applicationinsights";
import { AzureFunction, Context } from "@azure/functions";
import { ENV } from "../config";
import { convertToCsv, uploadResult } from "./lib";
import {
  getQueueClient,
  minimumMessagesAvailable,
  dequeueMessages,
  publishToQueue,
  reportExceptions,
  deleteSuccessfullyParsedMessages,
} from "../common/queueHandlers";
import { ReportStreamResponse } from "../common/types";

const {
  REPORT_STREAM_URL,
  TEST_EVENT_QUEUE_NAME,
  REPORTING_EXCEPTION_QUEUE_NAME,
  PUBLISHING_ERROR_QUEUE_NAME,
} = ENV;

appInsights.setup();
const telemetry = appInsights.defaultClient;

const QueueBatchedTestEventPublisher: AzureFunction = async function (
  context: Context,
): Promise<void> {
  const tagOverrides = { "ai.operation.id": context.traceContext.traceparent };
  const publishingQueue = getQueueClient(TEST_EVENT_QUEUE_NAME);
  const exceptionQueue = getQueueClient(REPORTING_EXCEPTION_QUEUE_NAME);
  const publishingErrorQueue = getQueueClient(PUBLISHING_ERROR_QUEUE_NAME);

  if (!(await minimumMessagesAvailable(context, publishingQueue))) {
    return;
  }

  const messages = await dequeueMessages(context, publishingQueue);
  telemetry.trackEvent({
    name: `Queue: ${TEST_EVENT_QUEUE_NAME}. Messages Dequeued`,
    properties: { messagesDequeued: messages.length },
    tagOverrides,
  });

  const { csvPayload, parseFailure, parseFailureCount, parseSuccessCount } =
    convertToCsv(messages);

  if (parseFailureCount > 0) {
    telemetry.trackEvent({
      name: `Queue: ${TEST_EVENT_QUEUE_NAME}. Test Event Parse Failure`,
      properties: {
        count: parseFailureCount,
        parseFailures: Object.keys(parseFailure),
      },
      tagOverrides,
    });
  }

  if (parseSuccessCount < 1) {
    context.log(
      `Queue: ${TEST_EVENT_QUEUE_NAME}. Successfully parsed message count of ${parseSuccessCount} is less than 1; aborting`,
    );
    return;
  }

  const uploadStart = new Date().getTime();
  context.log(
    `Queue: ${TEST_EVENT_QUEUE_NAME}. Starting upload of ${parseSuccessCount} records to ReportStream`,
  );

  const postResult = await uploadResult(csvPayload);

  telemetry.trackDependency({
    dependencyTypeName: "HTTP",
    name: "ReportStream",
    data: REPORT_STREAM_URL,
    properties: {
      recordCount: parseSuccessCount,
      queue: TEST_EVENT_QUEUE_NAME,
    },
    duration: new Date().getTime() - uploadStart,
    resultCode: postResult.status,
    success: postResult.ok,
    tagOverrides,
  });

  if (postResult.ok) {
    const response: ReportStreamResponse =
      (await postResult.json()) as ReportStreamResponse;
    context.log(
      `Queue: ${TEST_EVENT_QUEUE_NAME}. Report Stream response: ${JSON.stringify(
        response,
      )}`,
    );
    await reportExceptions(
      context,
      exceptionQueue,
      response,
      TEST_EVENT_QUEUE_NAME,
    );

    context.log(
      `Queue: ${TEST_EVENT_QUEUE_NAME}. Upload to ${response.destinationCount} reporting destinations successful; deleting messages`,
    );

    await deleteSuccessfullyParsedMessages(
      context,
      publishingQueue,
      messages,
      parseFailure,
    );
  } else {
    const responseBody = await postResult.text();
    const errorText = `Queue: ${TEST_EVENT_QUEUE_NAME}. Failed to upload to ReportStream with response code ${postResult.status}`;
    context.log.error(
      `${errorText}. Response body (${responseBody.length} bytes): `,
      responseBody,
    );
    telemetry.trackEvent({
      name: `Queue: ${TEST_EVENT_QUEUE_NAME}. ReportStream Upload Failed`,
      properties: {
        status: postResult.status,
        responseBody,
      },
      tagOverrides,
    });

    if (postResult.status === 400) {
      //publish messages to file failure queue
      await publishToQueue(publishingErrorQueue, messages);
      //delete messages from the main queue
      await deleteSuccessfullyParsedMessages(
        context,
        publishingQueue,
        messages,
        parseFailure,
      );
    }

    throw new Error(errorText);
  }
};

export default QueueBatchedTestEventPublisher;
