import { Context } from "@azure/functions";
import { DequeuedMessageItem, QueueClient } from "@azure/storage-queue";
import csvStringify from "csv-stringify/lib/sync";
import { ENV } from "./config";

const { REPORT_STREAM_BATCH_MINIMUM, REPORT_STREAM_BATCH_MAXIMUM } = ENV;
const DEQUEUE_BATCH_SIZE = 25;

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
    const dequeueResponse = await queueClient.receiveMessages({
      numberOfMessages: DEQUEUE_BATCH_SIZE,
    });
    if (dequeueResponse.receivedMessageItems.length) {
      messages.push(...dequeueResponse.receivedMessageItems);
      context.log(
        `Dequeued ${dequeueResponse.receivedMessageItems.length} messages`
      );
    } else {
      // There are no more messages on the queue
      context.log("Done receiving messages");
      break;
    }
  }
  return messages;
}

export function convertToCsv(messages: DequeuedMessageItem[]) {
  const parseFailure: { [k: string]: boolean } = {};
  const messageTexts = messages
    .map((m) => {
      try {
        return JSON.parse(m.messageText);
      } catch (e) {
        parseFailure[m.messageId] = true;
        return undefined;
      }
    })
    .filter((m) => m !== undefined);
  return {
    csvPayload: csvStringify(messageTexts, { header: true }),
    parseFailure,
    parseSuccessCount: messageTexts.length,
  };
}

export async function deleteSuccessfullyParsedMessages(
  context: Context,
  queueClient: QueueClient,
  messages: DequeuedMessageItem[],
  parseFailure: { [k: string]: boolean }
) {
  for (const message of messages) {
    if (parseFailure[message.messageId]) {
      context.log(
        `Message ${message.messageId} failed to parse; skipping deletion`
      );
      continue;
    }
    const deleteResponse = await queueClient.deleteMessage(
      message.messageId,
      message.popReceipt
    );
    context.log(
      `Message ${message.messageId} deleted with service id ${deleteResponse}`
    );
  }
  context.log("Deletion complete");
}
