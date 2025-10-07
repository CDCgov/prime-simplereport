import * as appInsights from "applicationinsights";
import { AzureFunction, Context } from "@azure/functions";
import { DequeuedMessageItem, QueueClient } from "@azure/storage-queue";
import { Response } from "node-fetch";
import { ENV } from "../config";
import {
  dequeueMessages,
  getQueueClient,
  minimumMessagesAvailable,
} from "../common/queueHandlers";
import { FHIRTestEventsBatch, processTestEvents } from "./dataHandlers";
import {
  getReportStreamAuthToken,
  handleReportStreamResponse,
  reportToUniversalPipelineTokenBased,
} from "../common/reportingHandlers";

const {
  REPORT_STREAM_URL,
  FHIR_TEST_EVENT_QUEUE_NAME,
  FHIR_PUBLISHING_ERROR_QUEUE_NAME,
  REPORTING_EXCEPTION_QUEUE_NAME,
} = ENV;

const FHIR_BATCH_SIZE_LIMIT = 99050000; // HTTP request size limit is 100MB so batch limit is set to 99.5MB

appInsights.setup();
const telemetry = appInsights.defaultClient;

const FHIRTestEventReporter: AzureFunction = async function (
  context: Context,
): Promise<void> {
  const tagOverrides = { "ai.operation.id": context.traceContext.traceparent };
  const publishingQueue: QueueClient = getQueueClient(
    FHIR_TEST_EVENT_QUEUE_NAME,
  );
  const publishingErrorQueue: QueueClient = getQueueClient(
    FHIR_PUBLISHING_ERROR_QUEUE_NAME,
  );
  const exceptionQueue: QueueClient = getQueueClient(
    REPORTING_EXCEPTION_QUEUE_NAME,
  );

  if (!(await minimumMessagesAvailable(context, publishingQueue))) {
    return;
  }

  const messages: DequeuedMessageItem[] = await dequeueMessages(
    context,
    publishingQueue,
  );

  telemetry.trackEvent({
    name: `Queue:${publishingQueue.name}. Messages Dequeued`,
    properties: { messagesDequeued: messages.length },
    tagOverrides,
  });

  if (messages.length === 0) {
    context.log(
      `Queue: ${publishingQueue.name}. Messages Dequeued: ${messages.length}; aborting.`,
    );
    return;
  }

  const fhirTestEventsBatches: FHIRTestEventsBatch[] = processTestEvents(
    messages,
    FHIR_BATCH_SIZE_LIMIT,
  );

  context.log(
    `Queue: ${publishingQueue.name}. Processing ${fhirTestEventsBatches.length} batch(s);`,
  );

  const bearerToken = await getReportStreamAuthToken(context);

  const fhirPublishingTasks: Promise<void>[] = fhirTestEventsBatches.map(
    (testEventBatch: FHIRTestEventsBatch, idx: number) => {
      // creates and returns a publishing task
      return new Promise<void>((resolve, reject) => {
        (async () => {
          try {
            const failureObj = {
              testEventBatch,
              publishingQueueName: publishingQueue.name,
              tagOverrides,
            };

            trackFailures(failureObj);

            if (testEventBatch.parseSuccessCount < 1) {
              context.log(
                `Queue: ${
                  publishingQueue.name
                }. Successfully parsed message count of ${
                  testEventBatch.parseSuccessCount
                } in batch ${idx + 1} is less than 1; aborting`,
              );

              return resolve();
            }

            context.log(
              `Queue: ${publishingQueue.name}. Starting upload of ${
                testEventBatch.parseSuccessCount
              } records in batch ${idx + 1} to ReportStream`,
            );

            const postResult: Response =
              await reportToUniversalPipelineTokenBased(
                bearerToken,
                testEventBatch.testEventsNDJSON,
              );

            const uploadStart = new Date().getTime();
            telemetry.trackDependency({
              dependencyTypeName: "HTTP",
              name: "ReportStream",
              data: REPORT_STREAM_URL,
              properties: {
                recordCount: testEventBatch.parseSuccessCount,
                queue: publishingQueue.name,
              },
              duration: new Date().getTime() - uploadStart,
              resultCode: postResult.status,
              success: postResult.ok,
              tagOverrides,
            });

            await handleReportStreamResponse(
              postResult,
              messages,
              testEventBatch.parseFailure,
              publishingQueue,
              exceptionQueue,
              publishingErrorQueue,
              { telemetry, context },
            );
            return resolve();
          } catch (e) {
            context.log.error(
              `Queue: ${publishingQueue.name}. Publishing tasks for batch ${
                idx + 1
              } failed unexpectedly; ${e}`,
            );

            return reject(e);
          }
        })();
      });
    },
  );

  // triggers all the publishing tasks
  const publishingResults = await Promise.allSettled(fhirPublishingTasks);
  const fulfilledPublishing = publishingResults.filter(
    (
      publishingStatus: PromiseSettledResult<any>, // eslint-disable-line @typescript-eslint/no-explicit-any
    ) => publishingStatus.status === "fulfilled",
  );
  const rejectedPublishing = publishingResults.filter(
    (
      publishingStatus: PromiseSettledResult<any>, // eslint-disable-line @typescript-eslint/no-explicit-any
    ) => publishingStatus.status === "rejected",
  );

  if (fulfilledPublishing.length > 0) {
    context.log(
      `Queue: ${publishingQueue.name}. ${fulfilledPublishing.length} batch(es) out of ${fhirPublishingTasks.length} were published successfully;`,
    );
  }

  if (rejectedPublishing.length > 0) {
    context.log.error(
      `Queue: ${publishingQueue.name}. ${rejectedPublishing.length} batch(es) out of ${fhirPublishingTasks.length} were not published;`,
    );

    throw new Error(
      `[${rejectedPublishing
        .map((rejected: PromiseRejectedResult) =>
          JSON.stringify(rejected.reason),
        )
        .join(", ")}]`,
    );
  }
};

const trackFailures = ({
  testEventBatch,
  tagOverrides,
  publishingQueueName,
}) => {
  if (testEventBatch.parseFailureCount > 0) {
    telemetry.trackEvent({
      name: `Queue:${publishingQueueName}. Test Event Parse Failure`,
      properties: {
        count: testEventBatch.parseFailureCount,
        parseFailures: Object.keys(testEventBatch.parseFailure),
      },
      tagOverrides,
    });
  }
};

export default FHIRTestEventReporter;
