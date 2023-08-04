import { Context } from "@azure/functions";
import {
  DequeuedMessageItem,
  QueueClient,
  QueueDeleteMessageResponse,
  QueueServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-queue";
import { ENV } from "../config";
import {
  ReportStreamError,
  ReportStreamResponse,
  SimpleReportReportStreamResponse,
  ReportStreamCallbackRequest,
} from "./types";

const {
  REPORT_STREAM_BATCH_MINIMUM,
  REPORT_STREAM_BATCH_MAXIMUM,
  AZ_STORAGE_ACCOUNT_KEY,
  AZ_STORAGE_ACCOUNT_NAME,
  AZ_STORAGE_QUEUE_SVC_URL,
} = ENV;

const DEQUEUE_BATCH_SIZE = 32;
const DEQUEUE_TIMEOUT = 60 * 60; // length of time in seconds a message is invisible after being dequeued

const getQueueServiceClient = (() => {
  let queueServiceClient: QueueServiceClient;
  return function getQueueServiceClientInner() {
    if (queueServiceClient !== undefined) {
      return queueServiceClient;
    }
    const credential = new StorageSharedKeyCredential(
      AZ_STORAGE_ACCOUNT_NAME,
      AZ_STORAGE_ACCOUNT_KEY,
    );
    queueServiceClient = new QueueServiceClient(
      AZ_STORAGE_QUEUE_SVC_URL,
      credential,
    );
    return queueServiceClient;
  };
})();

export function getQueueClient(queueName: string) {
  return getQueueServiceClient().getQueueClient(queueName);
}

export async function dequeueMessages(
  context: Context,
  queueClient: QueueClient,
): Promise<DequeuedMessageItem[]> {
  context.log(`Queue: ${queueClient.name}. Receiving messages`);
  const messages: DequeuedMessageItem[] = [];
  for (
    let messagesDequeued = 0;
    messagesDequeued < parseInt(REPORT_STREAM_BATCH_MAXIMUM, 10);
    messagesDequeued += DEQUEUE_BATCH_SIZE
  ) {
    try {
      const dequeueResponse = await queueClient.receiveMessages({
        numberOfMessages: DEQUEUE_BATCH_SIZE,
        visibilityTimeout: DEQUEUE_TIMEOUT,
      });
      if (dequeueResponse?.receivedMessageItems.length) {
        messages.push(...dequeueResponse.receivedMessageItems);
        context.log(
          `Queue: ${queueClient.name}. Dequeued ${dequeueResponse.receivedMessageItems.length} messages`,
        );
      } else {
        // There are no more messages on the queue
        context.log(`Queue: ${queueClient.name}. Done receiving messages`);
        break;
      }
    } catch (e) {
      context.log(`Queue: ${queueClient.name}. Failed to dequeue messages`, e);
    }
  }
  return messages;
}

export async function minimumMessagesAvailable(
  context: Context,
  queueClient: QueueClient,
) {
  const queueProperties = await queueClient.getProperties();

  const approxMessageCount = queueProperties.approximateMessagesCount;
  if (approxMessageCount === undefined) {
    context.log(
      `Queue: ${queueClient.name}. Queue message count is undefined; aborting`,
    );
    return false;
  }
  if (approxMessageCount < parseInt(REPORT_STREAM_BATCH_MINIMUM, 10)) {
    context.log(
      `Queue: ${queueClient.name}. Queue message count of ${approxMessageCount} was < ${REPORT_STREAM_BATCH_MINIMUM} minimum; aborting`,
    );
    return false;
  }
  return true;
}

export async function publishToQueue(
  queueClient: QueueClient,
  messages: DequeuedMessageItem[],
) {
  return Promise.all(
    messages.map((m) =>
      queueClient.sendMessage(Buffer.from(m.messageText).toString("utf-8")),
    ),
  );
}
export async function deleteSuccessfullyParsedMessages(
  context: Context,
  queueClient: QueueClient,
  messages: DequeuedMessageItem[],
  parseFailure: { [k: string]: boolean },
) {
  const validMessages: DequeuedMessageItem[] = [];
  const deletionPromises: Promise<QueueDeleteMessageResponse>[] = [];

  for (const message of messages) {
    if (parseFailure[message.messageId]) {
      context.log(
        `Queue: ${queueClient.name}. Message ${message.messageId} failed to parse; skipping deletion`,
      );
    } else {
      validMessages.push(message);
    }
  }

  for (const message of validMessages) {
    if (message.dequeueCount > 1) {
      context.log(
        `Queue: ${queueClient.name}. Message has been dequeued ${message.dequeueCount} times, possibly sent more than once to RS`,
      );
    }
    deletionPromises.push(
      queueClient.deleteMessage(message.messageId, message.popReceipt),
    );
  }

  try {
    const promiseValues = await Promise.allSettled(deletionPromises);
    for (let i = 0; i < promiseValues.length; i++) {
      const promise = promiseValues[i];
      const message = validMessages[i];
      if (promise.status == "fulfilled") {
        const deleteResponse = promise.value;
        const testEventId =
          JSON.parse(message.messageText)["Result_ID"] ||
          getTestEventIdFromFHIRBundle(JSON.parse(message.messageText));
        context.log(
          `Queue: ${queueClient.name}. Message ${message.messageId} deleted with request id ${deleteResponse.requestId} and has TestEvent id ${testEventId}`,
        );
      } else {
        context.log(
          `Queue: ${queueClient.name}. Failed to delete message ${message.messageId} from the queue:`,
        );
      }
    }
  } catch (e) {
    context.log(
      `Queue: ${queueClient.name}. The following error has occurred: ${e}`,
    );
  }
  context.log(`Queue: ${queueClient.name}. Deletion complete`);
}

export async function reportExceptions(
  context: Context,
  queueClient: QueueClient,
  response: ReportStreamResponse,
  eventQueueName: string,
) {
  context.log(
    `Queue: ${eventQueueName}. ReportStream response errors: ${response.errorCount}`,
  );
  context.log(
    `Queue: ${eventQueueName}. ReportStream response warnings: ${response.warningCount}`,
  );
  const payloads: SimpleReportReportStreamResponse[] = response.warnings
    .flatMap((w) => responsesFrom(eventQueueName, context, w, false))
    .concat(
      response.errors.flatMap((e) =>
        responsesFrom(eventQueueName, context, e, true),
      ),
    );
  return Promise.all(
    payloads.map((p) =>
      queueClient.sendMessage(
        Buffer.from(JSON.stringify(p)).toString("base64"),
      ),
    ),
  );
}

const responsesFrom = function (
  queueName: string,
  context: Context,
  err: ReportStreamError,
  isError: boolean,
): ReportStreamCallbackRequest[] {
  if (err.trackingIds) {
    return err.trackingIds.map((id) => ({
      testEventInternalId: id,
      isError,
      details: err.message,
      queueName: queueName,
    }));
  } else {
    context.log(
      `Queue: ${queueName}. ReportStream response ${err.scope} ${
        isError ? "error" : "warning"
      }: ${err.message}`,
    );
    return [];
  }
};
export function getTestEventIdFromFHIRBundle( // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fhirBundle: Record<any, any>,
): string | undefined {
  return fhirBundle?.entry?.filter((entry) => {
    return entry.resource?.resourceType === "DiagnosticReport";
  })?.[0]?.resource.id;
}
