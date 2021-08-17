import { DefaultAzureCredential } from "@azure/identity";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { QueueServiceClient } from "@azure/storage-queue";
import fetch, { Headers } from "node-fetch";
import { ENV } from "./config";
import { convertToCsv, deleteSuccessfullyParsedMessages, dequeueMessages, minimumMessagesAvailable } from "./lib";

const {
  AZ_QUEUE_SERVICE_URL,
  TEST_EVENT_QUEUE_NAME,
  REPORT_STREAM_URL,
  REPORT_STREAM_TOKEN,
} = ENV;

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

  if (!(await minimumMessagesAvailable(context, queueClient))) {
    return;
  }

  const messages = await dequeueMessages(context, queueClient);

  const { csvPayload, parseFailure, parseSuccessCount } =
    convertToCsv(messages);

  context.log(`Uploading ${parseSuccessCount} TestEvents to ReportStream`);
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
    await deleteSuccessfullyParsedMessages(context, queueClient, messages, parseFailure);
  } else {
    context.log(
      `Upload to ReportStream failed with error code ${postResult.status}`
    );
    context.log(`Response body: ${await postResult.text()}`);
  }
};


export default QueueBatchedTestEventPublisher;
