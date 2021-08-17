import { DefaultAzureCredential } from "@azure/identity";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { DequeuedMessageItem, QueueServiceClient } from "@azure/storage-queue";
import csvStringify from "csv-stringify/lib/sync";
import fetch, { Headers } from "node-fetch";
import { getConfigurationFromEnvironment } from "./config";

const {
  AZ_QUEUE_SERVICE_URL,
  TEST_EVENT_QUEUE_NAME,
  REPORT_STREAM_URL,
  REPORT_STREAM_TOKEN,
  REPORT_STREAM_BATCH_MINIMUM,
  REPORT_STREAM_BATCH_MAXIMUM,
} = getConfigurationFromEnvironment();

const DEQUEUE_BATCH_SIZE = 25;
const uploaderVersion = "2021-08-17";

const QueueBatchedTestEventPublisher: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const credential = new DefaultAzureCredential();
  const queueServiceClient = new QueueServiceClient(
    AZ_QUEUE_SERVICE_URL,
    credential
  );
  const queueClient = queueServiceClient.getQueueClient(TEST_EVENT_QUEUE_NAME);
  const queueProperties = await queueClient.getProperties();

  // Check that REPORT_STREAM_BATCH_SIZE messages are on the queue
  const approxMessageCount = queueProperties.approximateMessagesCount;
  if (approxMessageCount === undefined) {
    context.log("Queue message count is undefined; aborting");
    return;
  }
  if (approxMessageCount < parseInt(REPORT_STREAM_BATCH_MINIMUM, 10)) {
    context.log(
      `Queue message count of ${approxMessageCount} was < ${REPORT_STREAM_BATCH_MINIMUM} minimum; aborting`
    );
    return;
  }

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

  // Convert to CSV
  const parseFailure: {[k:string]: boolean} = {};
  const messageTexts = messages.map((m) => {
    try { 
      return JSON.parse(m.messageText)
    } catch(e) {
      parseFailure[m.messageId] = true;
      return undefined;
    }
  }).filter(m => !!m!== undefined); 
  const csvPayload = csvStringify(messageTexts, { header: true });

  context.log(`Uploading ${messageTexts.length} TestEvents to ReportStream`);
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

  if (postResult.ok) {
    context.log("Upload succeeded; deleting messages");
    for (const message of messages) {
      if(parseFailure[message.messageId]) {
        context.log(`Message ${message.messageId} failed to parse; skipping deletion`)
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
  } else {
    context.log(
      `Upload to ReportStream failed with error code ${postResult.status}`
    );
    context.log(`Response body: ${await postResult.text()}`);
  }
};

export default QueueBatchedTestEventPublisher;
