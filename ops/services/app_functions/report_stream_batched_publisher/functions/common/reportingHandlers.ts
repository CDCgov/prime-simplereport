import { Context } from "@azure/functions";
import {
    DequeuedMessageItem,
    QueueClient,
} from "@azure/storage-queue";

import { SimpleReportTestEvent } from "../FHIRTestEventReporter/dataHandlers";
import { ENV, uploaderVersion } from "../config";
import { ReportStreamResponse } from "./rs-response";
import {
    deleteSuccessfullyParsedMessages,
    publishToQueue,
    reportExceptions,
} from "./queueHandlers";
import * as appInsights from "applicationinsights";

const {
    REPORT_STREAM_TOKEN,
    REPORT_STREAM_URL,
} = ENV;

const telemetry = appInsights.defaultClient;

export async function reportTestEvents(results: SimpleReportTestEvent[]) {
    // ToDo check the size is complying with azure and break up the results if not
    const headers = new Headers({
        "x-functions-key": REPORT_STREAM_TOKEN,
        "x-api-version": uploaderVersion,
        "content-type": "application/json;charset=UTF-8",
        client: "simple_report",
    });

    return fetch(REPORT_STREAM_URL, {
        method: "POST",
        headers,
        body: JSON.stringify(results),
    });
}

export async function handleReportStreamResponse(reportingResponse: Response, context: Context, messages: DequeuedMessageItem[], parseFailure: Record<string, boolean>, testEventQueue: QueueClient, exceptionQueue: QueueClient, errorQueue: QueueClient) {
    if (reportingResponse.ok) {
        const response: ReportStreamResponse =
            (await reportingResponse.json()) as ReportStreamResponse;
        context.log(`Report Stream response: ${JSON.stringify(response)}`);
        await reportExceptions(context, exceptionQueue, response, testEventQueue.name);

        context.log(
            `Upload to ${response.destinationCount} reporting destinations successful; deleting messages`
        );

        await deleteSuccessfullyParsedMessages(
            context,
            testEventQueue,
            messages,
            parseFailure
        );
    } else {
        const responseBody = await reportingResponse.text();
        const errorText = `Queue: ${testEventQueue.name}. Failed to upload to ReportStream with response code ${reportingResponse.status}`;
        context.log.error(
            `${errorText}. Response body (${responseBody.length} bytes): `,
            responseBody
        );


        const tagOverrides = { "ai.operation.id": context.traceContext.traceparent };
        telemetry.trackEvent({
            name: `Queue: ${testEventQueue.name}. ReportStream Upload Failed`,
            properties: {
                status: reportingResponse.status,
                responseBody,
            },
            tagOverrides,
        });

        if (reportingResponse.status === 400) {
            //publish messages to file failure queue
            await publishToQueue(errorQueue, messages);
            //delete messages from the main queue
            await deleteSuccessfullyParsedMessages(context, testEventQueue, messages, parseFailure);
        }

        throw new Error(errorText);
    }
}