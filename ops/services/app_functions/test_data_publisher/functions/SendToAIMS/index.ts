import { app, InvocationContext, Timer } from "@azure/functions";
import {
  QueueServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-queue";
import { ENV } from "../config";
import { S3Client } from "@aws-sdk/client-s3";
import { processMessage } from "./messageProcessor";
import { getTelemetry } from "./telemetry";

// Initialize S3 client
const s3Client = new S3Client({
  credentials: {
    accessKeyId: ENV.AIMS_ACCESS_KEY_ID,
    secretAccessKey: ENV.AIMS_SECRET_ACCESS_KEY,
  },
  region: "us-east-1",
});

export async function SendToAIMS(
  _myTimer: Timer,
  context: InvocationContext,
): Promise<void> {
  const telemetry = getTelemetry();
  const operationId = context.traceContext.traceParent;

  telemetry.trackEvent({
    name: "SendToAIMS function started",
    properties: {
      operationId,
    },
  });
  //pulls the credentials from shared key
  try {
    //pull credentials
    const sharedKeyCredential = new StorageSharedKeyCredential(
      ENV.AZ_STORAGE_ACCOUNT_NAME,
      ENV.AZ_STORAGE_ACCOUNT_KEY,
    );
    // pull client
    const queueServiceClient = new QueueServiceClient(
      ENV.AZ_STORAGE_QUEUE_SVC_URL,
      sharedKeyCredential,
    );

    const queueClient = queueServiceClient.getQueueClient(
      "hl7v2-data-publishing",
    );

    context.log("Checking for messages in queue...");

    const response = await queueClient.receiveMessages({
      numberOfMessages: 32,
      visibilityTimeout: 300, // 5 minutes visibility timeout
    });

    if (
      !response.receivedMessageItems ||
      response.receivedMessageItems.length === 0
    ) {
      context.log("No messages found in queue");
      return;
    }

    context.log(`Processing ${response.receivedMessageItems.length} messages`);

    // Process messages
    for (const message of response.receivedMessageItems) {
      try {
        await processMessage({
          message,
          queueClient,
          s3Client,
          context,
          operationId,
        });
      } catch (error) {
        //message level catch
        const errMsg = error instanceof Error ? error.message : String(error);
        context.error(
          `Error processing message ${message.messageId}: ${errMsg}`,
        );
      }
    }
  } catch (error) {
    //Top level catch
    const errorMessage = error instanceof Error ? error.message : String(error);
    context.error(`SendToAIMS function failed: ${errorMessage}`);

    try {
      telemetry.trackEvent({
        name: "SendToAIMS function failed",
        properties: {
          operationId,
          errorMessage,
        },
      });

      telemetry.trackException({
        exception: new Error(`SendToAimsError: ${errorMessage}`),
        properties: {
          operationId,
          error: errorMessage,
        },
      });
    } catch (telemetryError) {
      context.warn(
        `Failed to track function failure telemetry: ${telemetryError}`,
      );
    }
  }
}

app.timer("SendToAIMS", {
  schedule: "0 */5 * * * *",
  handler: SendToAIMS,
});
