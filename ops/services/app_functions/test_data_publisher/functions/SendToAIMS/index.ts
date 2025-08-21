import * as appInsights from "applicationinsights";
import { app, InvocationContext, Timer } from "@azure/functions";
import {
  QueueServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-queue";
import { ENV } from "../config";
import {
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from "@aws-sdk/client-s3";

appInsights.setup();
const telemetry = appInsights.defaultClient;

interface HL7Message {
  content: string;
  messageId?: string;
  filename?: string;
}

type Environment = "Test" | "Prod";

export function formatInterPartnerFilename(
  env: Environment,
  timestamp: Date,
  sof: string,
): string {
  // Format: InterPartner~DatapultELRPivot~Simple-Report~AIMSPlatform~<SE>~<RE>~<Timestamp>~STOP~<SOF>
  const uc = "DatapultELRPivot";
  const sj = "Simple-Report";
  const rj = "AIMSPlatform";
  const se = env; //sending environment we could potentially consolidate to one variable
  const re = env; //recieving environment
  const formattedTimestamp = formatTimestamp(timestamp);
  const stop = "STOP";

  return `InterPartner~${uc}~${sj}~${rj}~${se}~${re}~${formattedTimestamp}~${stop}~${sof}`;
}

export function formatTimestamp(date: Date): string {
  // Format: yyyyMMddHHmmssSSS (17 digits)
  const year = date.getUTCFullYear().toString();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const day = date.getUTCDate().toString().padStart(2, "0");
  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  const seconds = date.getUTCSeconds().toString().padStart(2, "0");
  const milliseconds = date.getUTCMilliseconds().toString().padStart(3, "0");

  return `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
}

export async function SendToAIMS(
  _myTimer: Timer,
  context: InvocationContext,
): Promise<void> {
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

    //Pattern to Access S3 Keys
    const client = new S3Client({
      credentials: {
        accessKeyId: ENV.AIMS_ACCESS_KEY_ID,
        secretAccessKey: ENV.AIMS_SECRET_ACCESS_KEY,
      },
      region: "us-east-1",
    });

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

    // Process message
    for (const message of response.receivedMessageItems) {
      try {
        const hl7Message = parseHL7Message(message.messageText);

        // Check message size and log if larger than 64KB which might not be processed
        const approxBytes = Buffer.byteLength(
          message.messageText || "",
          "utf8",
        );
        telemetry.trackEvent({
          name: "MessageSizeObserved",
          properties: { bytes: String(approxBytes) },
        });

        if (approxBytes > 64 * 1024) {
          context.warn(
            `Large message detected: ${approxBytes} bytes (>64KB). Message ID: ${hl7Message.messageId || "unknown"}`,
          );
          telemetry.trackEvent({
            name: "LargeMessageDetected",
            properties: {
              operationId,
              messageId: hl7Message.messageId || "unknown",
              sizeBytes: String(approxBytes),
              threshold: "64KB",
            },
          });
        }

        // Parse messageID from HL7
        const messageId = hl7Message.messageId;
        const filename = hl7Message.filename || `hl7-message-${Date.now()}.hl7`;
        const objectKey = `${ENV.AIMS_USER_ID}/SendTo/${filename}`;

        // Populate metadata following AIMS pattern
        const metadata = {
          AIMSPlatformSender: "SimpleReport",
          AIMSPlatformRecipient: "AIMSPlatform",
          AIMSPlatformSenderProject: "ELR",
          AIMSPlatformSenderProtocol: "S3",
          AIMSPlatformSenderEncryptionType: "KMS",
          AIMSPlatformFilename: filename,
          AIMSPlatformSenderMessageId: messageId,
          Base64Encoded: "False",
        };
        const uploadParams = {
          Bucket: ENV.AIMS_BUCKET_NAME,
          Key: objectKey,
          Body: hl7Message.content,
          Metadata: metadata,
          ServerSideEncryption: "aws:kms" as const,
          SSEKMSKeyId: ENV.AIMS_KMS_ENCRYPTION_KEY,
        };

        const command = new PutObjectCommand(uploadParams);

        // Track S3 dependency
        const startTime = Date.now();
        try {
          await client.send(command);

          telemetry.trackDependency({
            target: ENV.AIMS_OUTBOUND_ENDPOINT,
            name: "S3 PutObject",
            data: objectKey,
            duration: Date.now() - startTime,
            success: true,
            dependencyTypeName: "S3",
          });
        } catch (s3Error) {
          telemetry.trackDependency({
            target: ENV.AIMS_OUTBOUND_ENDPOINT,
            name: "S3 PutObject",
            data: objectKey,
            duration: Date.now() - startTime,
            success: false,
            dependencyTypeName: "S3",
          });
          throw s3Error;
        }

        // Delete message from queue only after successful S3 upload
        try {
          await queueClient.deleteMessage(
            message.messageId,
            message.popReceipt,
          );
        } catch (deleteError) {
          // Log deletion error
          const deleteErrorMessage =
            deleteError instanceof Error
              ? deleteError.message
              : String(deleteError);
          context.warn(
            `Failed to delete message ${message.messageId} from queue after successful S3 upload: ${deleteErrorMessage}`,
          );
          telemetry.trackEvent({
            name: "Queue message deletion failed",
            properties: {
              operationId,
              messageId: messageId || message.messageId,
              error: deleteErrorMessage,
              s3Key: objectKey,
            },
          });
        }

        context.log(
          `Successfully processed message ${messageId} and uploaded to S3 key: ${objectKey}`,
        );

        telemetry.trackEvent({
          name: "Message successfully processed",
          properties: {
            operationId,
            messageId,
            s3Key: objectKey,
          },
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        // Handle S3-specific errors
        if (error instanceof S3ServiceException) {
          if (error.name === "EntityTooLarge") {
            context.error(
              `Error from S3 while uploading message ${message.messageId}. ` +
                "The message was too large. Maximum size is 5GB.",
            );
          } else {
            context.error(
              `Error from S3 while uploading message ${message.messageId}. ${error.name}: ${error.message}`,
            );
          }
        } else {
          context.error(
            `Failed to process message ${message.messageId}: ${errorMessage}`,
          );
        }

        try {
          telemetry.trackEvent({
            name: "Message processing failed",
            properties: {
              operationId,
              messageId: message.messageId,
              errorType:
                error instanceof S3ServiceException
                  ? "S3Error"
                  : "GeneralError",
              errorMessage,
            },
          });

          telemetry.trackException({
            exception: new Error(`SendToAimsError: ${errorMessage}`),
            properties: {
              operationId,
              messageId: message.messageId,
              errorType:
                error instanceof S3ServiceException
                  ? "S3Error"
                  : "GeneralError",
            },
          });
        } catch (telemetryError) {
          context.warn(`Failed to track telemetry: ${telemetryError}`);
        }
      }
    }
  } catch (error) {
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
    throw error;
  }
}

export function parseHL7Message(messageText: string): HL7Message {
  // Extract message ID from HL7 MSH segment if available
  let messageId = "abcd1234messageIDNotFound";
  let baseFilename = `hl7-message-${Date.now()}.hl7`;

  if (messageText) {
    // Look for MSH segment message control ID (MSH.10)
    const mshSegmentMatch = messageText.match(/^MSH\|(?:[^|]*\|){8}([^|]*)\|/m);
    if (mshSegmentMatch && mshSegmentMatch[1]) {
      messageId = mshSegmentMatch[1].trim();
      baseFilename = `${messageId}.hl7`;
    }
  }

  // Generate InterPartner formatted filename with validation
  const rawEnv = ENV.AIMS_ENVIRONMENT;
  const env: Environment =
    rawEnv === "Test" || rawEnv === "Prod" ? rawEnv : "Test";
  const timestamp = new Date();
  const interPartnerFilename = formatInterPartnerFilename(
    env,
    timestamp,
    baseFilename,
  );

  return {
    content: messageText || "",
    messageId,
    filename: interPartnerFilename,
  };
}

app.timer("SendToAIMS", {
  schedule: "0 */5 * * * *",
  handler: SendToAIMS,
});
