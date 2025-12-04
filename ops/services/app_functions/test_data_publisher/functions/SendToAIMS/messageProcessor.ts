import { InvocationContext } from "@azure/functions";
import {
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from "@aws-sdk/client-s3";
import { QueueClient } from "@azure/storage-queue";
import { ENV } from "../config";
import { parseHL7Message } from "./hl7utils";
import { getTelemetry } from "./telemetry";

interface ProcessMessageOptions {
  message: any;
  queueClient: QueueClient;
  s3Client: S3Client;
  context: InvocationContext;
  operationId: string;
}

export async function processMessage({
  message,
  queueClient,
  s3Client,
  context,
  operationId,
}: ProcessMessageOptions): Promise<void> {
  const telemetry = getTelemetry();

  try {
    const hl7Message = parseHL7Message(message.messageText);
    console.log(`Parsed HL7 message text is ${hl7Message.content}`);

    // Check message size and log if larger than 64KB which might not be processed
    const approxBytes = Buffer.byteLength(message.messageText || "", "utf8");
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
    const filename = hl7Message.filename;
    const objectKey = `${ENV.AIMS_USER_ID}/SendTo/${filename}`;

    // Upload to S3
    await uploadToS3({
      s3Client,
      hl7Message,
      objectKey,
      messageId,
      operationId,
      telemetry,
    });

    // Delete message from queue only after successful S3 upload
    try {
      await queueClient.deleteMessage(message.messageId, message.popReceipt);
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
          messageId: messageId,
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
    const errorMessage = error instanceof Error ? error.message : String(error);

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
            error instanceof S3ServiceException ? "S3Error" : "GeneralError",
          errorMessage,
        },
      });

      telemetry.trackException({
        exception: new Error(`SendToAimsError: ${errorMessage}`),
        properties: {
          operationId,
          messageId: message.messageId,
          errorType:
            error instanceof S3ServiceException ? "S3Error" : "GeneralError",
        },
      });
    } catch (telemetryError) {
      context.warn(`Failed to track telemetry: ${telemetryError}`);
    }

    throw error;
  }
}

interface UploadToS3Options {
  s3Client: S3Client;
  hl7Message: any;
  objectKey: string;
  messageId: string;
  operationId: string;
  telemetry: any;
}

async function uploadToS3({
  s3Client,
  hl7Message,
  objectKey,
  messageId,
  operationId,
  telemetry,
}: UploadToS3Options): Promise<void> {
  const filename = hl7Message.filename;

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

  console.log(`HL7 message content is ${hl7Message.content}`);

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
    const response = await s3Client.send(command);

    if (
      response.$metadata?.httpStatusCode &&
      response.$metadata.httpStatusCode >= 400
    ) {
      throw new Error(
        `S3 upload failed with status ${response.$metadata.httpStatusCode}`,
      );
    }

    telemetry.trackDependency({
      name: "S3 PutObject",
      data: objectKey,
      duration: Date.now() - startTime,
      success: true,
      dependencyTypeName: "S3",
    });
  } catch (s3Error) {
    telemetry.trackDependency({
      name: "S3 PutObject",
      data: objectKey,
      duration: Date.now() - startTime,
      success: false,
      dependencyTypeName: "S3",
    });
    throw s3Error;
  }
}
