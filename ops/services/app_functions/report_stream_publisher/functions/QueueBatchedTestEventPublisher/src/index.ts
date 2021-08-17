import { DefaultAzureCredential } from "@azure/identity";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { DequeuedMessageItem, QueueServiceClient } from "@azure/storage-queue";
import csvStringify from "csv-stringify/lib/sync";
import fetch, { Headers } from "node-fetch";
import fetchFromEnvironmentOrThrow from "./fetchOrThrow";

const ACCOUNT_NAME = fetchFromEnvironmentOrThrow(
  "AZ_ACCOUNT_NAME",
  "Azure account name for Queue Service URL"
);
const QUEUE_NAME = fetchFromEnvironmentOrThrow(
  "TEST_EVENT_QUEUE_NAME",
  "Storage queue resource name for Test Events"
);
const REPORT_STREAM_URL = fetchFromEnvironmentOrThrow(
  "REPORT_STREAM_URL",
  "ReportStream URL to which tests should be reported"
);
const REPORT_STREAM_TOKEN = fetchFromEnvironmentOrThrow(
  "REPORT_STREAM_TOKEN",
  "ReportStream token"
);
const REPORT_STREAM_BATCH_SIZE = 100;
const DEQUEUE_BATCH_SIZE = 25;
const uploaderVersion = "2021-08-17";

const QueueBatchedTestEventPublisher: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const credential = new DefaultAzureCredential();
  const queueServiceClient = new QueueServiceClient(
    `https://${ACCOUNT_NAME}.queue.core.windows.net`,
    credential
  );
  const queueClient = queueServiceClient.getQueueClient(QUEUE_NAME);

  // Check that REPORT_STREAM_BATCH_SIZE messages are on the queue
  const queueProperties = await queueClient.getProperties();
  const approxMessageCount = queueProperties.approximateMessagesCount;
  if (approxMessageCount === undefined) {
    context.log("Queue message count is undefined; aborting");
    return;
  }

  if (approxMessageCount < REPORT_STREAM_BATCH_SIZE) {
    context.log(
      `Queue message count of ${approxMessageCount} was < ${REPORT_STREAM_BATCH_SIZE} minimum; aborting`
    );
    return;
  }

  context.log("Beginning to dequeue messages");
  const messages: DequeuedMessageItem[] = [];
  for (
    let messagesDequeued = 0;
    messagesDequeued < REPORT_STREAM_BATCH_SIZE;
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
    }

    // Convert to CSV
    const messageTexts = messages.map((m) => JSON.parse(m.messageText)); // TODO: harden against individual parse failure
    const csvPayload = csvStringify(messageTexts, { header: true });

    // POST to ReportStream
    const postResult = await fetch(REPORT_STREAM_URL, {
      method: "POST",
      headers: new Headers({
        "x-functions-key": REPORT_STREAM_TOKEN,
        "x-api-version": uploaderVersion,
        "content-type": "text/csv",
        client: "simple_report_queue_worker",
      }),
      body: csvPayload,
    });

    if(postResult.ok) {
      // Delete all dequeued messages
      for(const message of messages) {
        const deleteResponse = await queueClient.deleteMessage(message.messageId, message.popReceipt);
        context.log(`Message ${message.messageId} deleted with service id ${deleteResponse}`);
      } 
    } else {
      context.log(`Upload to ReportStream failed with error code ${postResult.status}`);
      context.log(`Response body: ${await postResult.text()}`);
    }
  }
};

export default QueueBatchedTestEventPublisher;