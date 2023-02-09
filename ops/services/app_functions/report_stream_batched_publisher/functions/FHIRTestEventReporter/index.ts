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
import { FHIRTestEventsBundle, processTestEvents } from "./dataHandlers";
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

const BUNDLE_SIZE_LIMIT = 99050000;// HTTP request size limit is 100MB so bundle limit is set to 99.5MB

appInsights.setup();
const telemetry = appInsights.defaultClient;

const FHIRTestEventReporter: AzureFunction = async function (
    context: Context
): Promise<void> {
  const tagOverrides = {"ai.operation.id": context.traceContext.traceparent};
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

  telemetry.trackEvent({
    name: `Queue:${publishingQueue.name}. Messages Dequeued`,
    properties: { messagesDequeued: messages.length },
    tagOverrides,
  });


  const fhirBundles: FHIRTestEventsBundle[] = processTestEvents(messages, BUNDLE_SIZE_LIMIT);

  context.log(
      `Queue: ${publishingQueue.name}. Processing ${fhirBundles.length} bundles;`
  );

  const fhirPublishingTasks: Promise<void>[] = fhirBundles.map((bundle: FHIRTestEventsBundle, idx: number) => {
    // returns a publishing task
    return new Promise<void>(resolve => {
      (async () => {
        try {
          if (bundle.parseFailureCount > 0) {
            telemetry.trackEvent({
              name: `Queue:${publishingQueue.name}. Test Event Parse Failure`,
              properties: {
                count: bundle.parseFailureCount,
                parseFailures: Object.keys(bundle.parseFailure),
              },
              tagOverrides,
            });
          }

      if (bundle.parseSuccessCount < 1) {
        context.log(
            `Queue: ${publishingQueue.name}. Successfully parsed message count of ${bundle.parseSuccessCount} in bundle ${idx} is less than 1; aborting`
        );

        return resolve();
      }

      context.log(
          `Queue: ${publishingQueue.name}. Starting upload of ${bundle.parseSuccessCount} records in bundle ${idx + 1} to ReportStream`
      );

      const postResult: Response = await reportToUniversalPipeline(bundle.testEventsNDJSON);

      const uploadStart = new Date().getTime();
      telemetry.trackDependency({
        dependencyTypeName: "HTTP",
        name: "ReportStream",
        data: REPORT_STREAM_URL,
        properties: {
          recordCount: bundle.parseSuccessCount,
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
              bundle.parseFailure,
              publishingQueue,
              exceptionQueue,
              publishingErrorQueue
          );
        } catch (e) {
          context.log(
              `Queue: ${publishingQueue.name}. Publishing tasks for bundle ${idx + 1} failed unexpectedly; ${e}`
          );
        }
        return resolve();
      })()
    });
  });

  await Promise.allSettled(fhirPublishingTasks);

  context.log(
      `Queue: ${publishingQueue.name}. All ${fhirBundles.length} bundle(s) published;`
  );
};

export default FHIRTestEventReporter;
