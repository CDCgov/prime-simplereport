import { Context } from "@azure/functions";
import {
  DequeuedMessageItem,
  QueueClient,
  QueueDeleteMessageResponse,
  QueueServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-queue";
import csvStringify from "csv-stringify/lib/sync";
import { ENV, uploaderVersion } from "../config";
import fetch, { Headers } from "node-fetch";
import {
  ReportStreamError,
  ReportStreamResponse,
  SimpleReportReportStreamResponse,
} from "./rs-response";

const {
  REPORT_STREAM_BATCH_MINIMUM,
  REPORT_STREAM_BATCH_MAXIMUM,
  REPORT_STREAM_TOKEN,
  REPORT_STREAM_URL,
  AZ_STORAGE_ACCOUNT_KEY,
  AZ_STORAGE_ACCOUNT_NAME,
  AZ_STORAGE_QUEUE_SVC_URL,
} = ENV;
const DEQUEUE_BATCH_SIZE = 32;

const getQueueServiceClient = (() => {
  let queueServiceClient: QueueServiceClient;
  return function getQueueServiceClientInner() {
    if (queueServiceClient !== undefined) {
      return queueServiceClient;
    }
    const credential = new StorageSharedKeyCredential(
      AZ_STORAGE_ACCOUNT_NAME,
      AZ_STORAGE_ACCOUNT_KEY
    );
    queueServiceClient = new QueueServiceClient(
      AZ_STORAGE_QUEUE_SVC_URL,
      credential
    );
    return queueServiceClient;
  };
})();

export function getQueueClient(queueName: string) {
  return getQueueServiceClient().getQueueClient(queueName);
}

export async function minimumMessagesAvailable(
  context: Context,
  queueClient: QueueClient
) {
  const queueProperties = await queueClient.getProperties();

  const approxMessageCount = queueProperties.approximateMessagesCount;
  if (approxMessageCount === undefined) {
    context.log("Queue message count is undefined; aborting");
    return false;
  }
  if (approxMessageCount < parseInt(REPORT_STREAM_BATCH_MINIMUM, 10)) {
    context.log(
      `Queue message count of ${approxMessageCount} was < ${REPORT_STREAM_BATCH_MINIMUM} minimum; aborting`
    );
    return false;
  }
  return true;
}

export async function dequeueMessages(
  context: Context,
  queueClient: QueueClient
): Promise<DequeuedMessageItem[]> {
  context.log("Receiving messages");
  const messages: DequeuedMessageItem[] = [];
  for (
    let messagesDequeued = 0;
    messagesDequeued < parseInt(REPORT_STREAM_BATCH_MAXIMUM, 10);
    messagesDequeued += DEQUEUE_BATCH_SIZE
  ) {
    try {
      const dequeueResponse = await queueClient.receiveMessages({
        numberOfMessages: DEQUEUE_BATCH_SIZE,
      });
      if (dequeueResponse?.receivedMessageItems.length) {
        messages.push(...dequeueResponse.receivedMessageItems);
        context.log(
          `Dequeued ${dequeueResponse.receivedMessageItems.length} messages`
        );
      } else {
        // There are no more messages on the queue
        context.log("Done receiving messages");
        break;
      }
    } catch (e) {
      context.log("Failed to dequeue messages", e);
    }
  }
  return messages;
}

export function convertToCsv(messages: DequeuedMessageItem[]) {
  const parseFailure: { [k: string]: boolean } = {};
  let parseFailureCount = 0;
  const messageTexts = messages
    .map((m) => {
      try {
        return JSON.parse(m.messageText);
      } catch (e) {
        parseFailure[m.messageId] = true;
        parseFailureCount++;
        return undefined;
      }
    })
    .filter((m) => m !== undefined);
  return {
    csvPayload: csvStringify(messageTexts, { header: true }),
    parseFailure,
    parseFailureCount,
    parseSuccessCount: messageTexts.length,
  };
}

export async function uploadResult(body) {
  const headers = new Headers({
    "x-functions-key": REPORT_STREAM_TOKEN,
    "x-api-version": uploaderVersion,
    "content-type": "text/csv",
    client: "simple_report",
  });
  return fetch(REPORT_STREAM_URL, {
    method: "POST",
    headers,
    body,
  });
}

export async function deleteSuccessfullyParsedMessages(
  context: Context,
  queueClient: QueueClient,
  messages: DequeuedMessageItem[],
  parseFailure: { [k: string]: boolean }
) {
  const validMessages: DequeuedMessageItem[] = [];
  const deletionPromises: Promise<QueueDeleteMessageResponse>[] = [];

  for (const message of messages) {
    if (parseFailure[message.messageId]) {
      context.log(
        `Message ${message.messageId} failed to parse; skipping deletion`
      );
    } else {
      validMessages.push(message);
    }
  }

  for (const message of validMessages) {
    if (message.dequeueCount > 1) {
      context.log(
        `Message has been dequeued ${message.dequeueCount} times, possibly sent more than once to RS`
      );
    }
    deletionPromises.push(
      queueClient.deleteMessage(message.messageId, message.popReceipt)
    );
  }

  try {
    const promiseValues = await Promise.allSettled(deletionPromises);
    for (let i = 0; i < promiseValues.length; i++) {
      const promise = promiseValues[i];
      const message = validMessages[i];
      if (promise.status == "fulfilled") {
        const deleteResponse = promise.value;
        const testEventId = JSON.parse(message.messageText)["Result_ID"];
        context.log(
          `Message ${message.messageId} deleted with request id ${deleteResponse.requestId} and has TestEvent id ${testEventId}`
        );
      } else {
        context.log(
          `Failed to delete message ${message.messageId} from the queue:`
        );
      }
    }
  } catch (e) {
    context.log(`The following error has occurred: ${e}`);
  }
  context.log("Deletion complete");
}

export async function reportExceptions(
  context: Context,
  queueClient: QueueClient,
  response: ReportStreamResponse
) {
  context.log(`ReportStream response errors: ${response.errorCount}`);
  context.log(`ReportStream response warnings: ${response.warningCount}`);
  const payloads: SimpleReportReportStreamResponse[] = response.warnings
    .flatMap((w) => responsesFrom(context, w, false))
    .concat(response.errors.flatMap((e) => responsesFrom(context, e, true)));
  return Promise.all(
    payloads.map((p) =>
      queueClient.sendMessage(Buffer.from(JSON.stringify(p)).toString("base64"))
    )
  );
}

const responsesFrom = function (
  context: Context,
  err: ReportStreamError,
  isError: boolean
): SimpleReportReportStreamResponse[] {
  if (err.trackingIds) {
    return err.trackingIds.map((id) => ({
      testEventInternalId: id,
      isError,
      details: err.message,
    }));
  } else {
    context.log(
      `ReportStream response ${err.scope} ${isError ? "error" : "warning"}: ${
        err.message
      }`
    );
    return [];
  }
};
