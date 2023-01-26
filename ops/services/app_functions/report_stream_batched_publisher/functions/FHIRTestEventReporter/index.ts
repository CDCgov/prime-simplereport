import * as appInsights from "applicationinsights";
import { AzureFunction, Context } from "@azure/functions";
import {
    DequeuedMessageItem,
    QueueClient,
} from "@azure/storage-queue";
import { ENV } from "../config";
import {
    dequeueMessages,
    getQueueClient,
    minimumMessagesAvailable,
} from "../common/queueHandlers";
import { ProcessedTestEvents, processTestEvents } from "./dataHandlers";
import { handleReportStreamResponse, reportTestEvents } from "../common/reportingHandlers";

const {
    REPORT_STREAM_URL,
    TEST_EVENT_QUEUE_NAME_FHIR,
    REPORTING_EXCEPTION_QUEUE_NAME_FHIR,
    PUBLISHING_ERROR_QUEUE_NAME,
} = ENV;

appInsights.setup();
const telemetry = appInsights.defaultClient;

const FHIRTestEventReporter: AzureFunction = async function (
    context: Context
): Promise<void> {
    const tagOverrides = {"ai.operation.id": context.traceContext.traceparent};
    const publishingQueue: QueueClient = getQueueClient(TEST_EVENT_QUEUE_NAME_FHIR);
    const exceptionQueue: QueueClient = getQueueClient(REPORTING_EXCEPTION_QUEUE_NAME_FHIR);
    const publishingErrorQueue: QueueClient = getQueueClient(PUBLISHING_ERROR_QUEUE_NAME);

    if (!(await minimumMessagesAvailable(context, publishingQueue))) {
        return;
    }

    const messages: DequeuedMessageItem[] = await dequeueMessages(context, publishingQueue);

    telemetry.trackEvent({
        name: `Queue:${publishingQueue.name}. Messages Dequeued`,
        properties: { messagesDequeued: messages.length },
        tagOverrides,
    });

    const {testEvents, parseFailure, parseFailureCount, parseSuccessCount}:ProcessedTestEvents =
        processTestEvents(messages);

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

    if (parseSuccessCount < 1) {
        context.log(
            `Queue: ${publishingQueue.name}. Successfully parsed message count of ${parseSuccessCount} is less than 1; aborting`
        );
        return;
    }

    context.log(
        `Queue: ${publishingQueue.name}. Starting upload of ${parseSuccessCount} records to ReportStream`
    );

    const postResult: Response = await reportTestEvents(testEvents);


    const uploadStart = new Date().getTime();
    telemetry.trackDependency({
        dependencyTypeName: "HTTP",
        name: "ReportStream",
        data: REPORT_STREAM_URL,
        properties: {
            recordCount: parseSuccessCount,
            queue: publishingQueue.name
        },
        duration: new Date().getTime() - uploadStart,
        resultCode: postResult.status,
        success: postResult.ok,
        tagOverrides,
    });

    await handleReportStreamResponse(postResult, context, messages, parseFailure, publishingQueue, exceptionQueue, publishingErrorQueue);
};

export default FHIRTestEventReporter;
