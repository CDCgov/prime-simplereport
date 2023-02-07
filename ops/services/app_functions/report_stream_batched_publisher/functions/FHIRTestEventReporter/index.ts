import * as appInsights from "applicationinsights";
import { AzureFunction, Context } from "@azure/functions";
import { DequeuedMessageItem, QueueClient } from "@azure/storage-queue";
import { ENV } from "../config";
import {
  dequeueMessages,
  getQueueClient,
  minimumMessagesAvailable,
} from "../common/queueHandlers";
import { ProcessedTestEvents, processTestEvents, serializeTestEventsAsNdjson } from "./dataHandlers";
import {
  handleReportStreamResponse,
  reportToUniversalPipeline,
} from "../common/reportingHandlers";

const {
  REPORT_STREAM_URL,
  FHIR_TEST_EVENT_QUEUE_NAME,
  FHIR_PUBLISHING_ERROR_QUEUE_NAME,
  REPORTING_EXCEPTION_QUEUE_NAME
} = ENV;

appInsights.setup();
const telemetry = appInsights.defaultClient;

const FHIRTestEventReporter: AzureFunction = async function (
  context: Context
): Promise<void> {
  const tagOverrides = { "ai.operation.id": context.traceContext.traceparent };
  const publishingQueue: QueueClient = getQueueClient(
    FHIR_TEST_EVENT_QUEUE_NAME
  );
  const publishingErrorQueue: QueueClient = getQueueClient(
      FHIR_PUBLISHING_ERROR_QUEUE_NAME
  );
  const exceptionQueue: QueueClient = getQueueClient(
      REPORTING_EXCEPTION_QUEUE_NAME
  );

  if (!(await minimumMessagesAvailable(context, publishingQueue))) {
    return;
  }

  const messages: DequeuedMessageItem[] = await dequeueMessages(
    context,
    publishingQueue
  );

  // do we split the messages here???
  // ToDo check the size is complying with azure and break up the results if not
  //Buffer.byteLength(jsonAsString)

  telemetry.trackEvent({
    name: `Queue:${publishingQueue.name}. Messages Dequeued`,
    properties: { messagesDequeued: messages.length },
    tagOverrides,
  });

  const {
    testEvents,
    parseFailure,
    parseFailureCount,
    parseSuccessCount,
  }: ProcessedTestEvents = processTestEvents(messages);


  if (parseFailureCount > 0) {
    telemetry.trackEvent({
      name: `Queue:${publishingQueue.name}. Test Event Parse Failure`,
      properties: {
        count: parseFailureCount,
        parseFailures: Object.keys(parseFailure),
      },
      tagOverrides,
    });
  }

  // maybe this log that is correlation to overall message summary stays but we add a new one on the splitting of the
  if (parseSuccessCount < 1) {
    context.log(
        `Queue: ${publishingQueue.name}. Successfully parsed message count of ${parseSuccessCount} is less than 1; aborting`
    );
    return;
  }

  context.log(
      `Queue: ${publishingQueue.name}. Starting upload of ${parseSuccessCount} records to ReportStream`
  );

  const postResult: Response = await reportToUniversalPipeline(serializeTestEventsAsNdjson(testEvents));

  const uploadStart = new Date().getTime();
  telemetry.trackDependency({
    dependencyTypeName: "HTTP",
    name: "ReportStream",
    data: REPORT_STREAM_URL,
    properties: {
      recordCount: parseSuccessCount,
      queue: publishingQueue.name,
    },
    duration: new Date().getTime() - uploadStart,
    resultCode: postResult.status,
    success: postResult.ok,
    tagOverrides,
  });

  await handleReportStreamResponse(
    postResult,
    context,
    messages,
    parseFailure,
    publishingQueue,
    exceptionQueue,
    publishingErrorQueue
  );
};

export default FHIRTestEventReporter;
