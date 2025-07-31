import * as appInsights from "applicationinsights";
import {app, InvocationContext, Timer} from "@azure/functions";
import {QueueServiceClient, StorageSharedKeyCredential} from "@azure/storage-queue";
import {v4 as uuidv4} from "uuid";
import {ENV} from "../config";
import {PutObjectCommand, S3Client, S3ServiceException} from "@aws-sdk/client-s3";

appInsights.setup();
const telemetry = appInsights.defaultClient;

interface HL7Message {
    content: string;
    messageId?: string;
    filename?: string;
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
    try {
        //pull credentials
        const sharedKeyCredential = new StorageSharedKeyCredential(
            ENV.AZ_STORAGE_ACCOUNT_NAME,
            ENV.AZ_STORAGE_ACCOUNT_KEY
        );
        // pull client
        const queueServiceClient = new QueueServiceClient(
            ENV.AZ_STORAGE_QUEUE_SVC_URL,
            sharedKeyCredential
        );


        const queueClient = queueServiceClient.getQueueClient("hl7v2-data-publishing");

        //How to access AWS keys?
       const client = new S3Client({
    credentials: {
      accessKeyId: process.env.AIMS_ACCESS_KEY_ID_TEST,
      secretAccessKey: process.env.AIMS_SECRET_ACCESS_KEY_TEST,
    },
    region: "us-east-1",
  });

        context.log("Checking for messages in queue...");

        const response = await queueClient.receiveMessages({
            numberOfMessages: 32,
            visibilityTimeout: 60,
        });

        if (!response.receivedMessageItems || response.receivedMessageItems.length === 0) {
            context.log("No messages found in queue");
            return;
        }

        context.log(`Processing ${response.receivedMessageItems.length} messages`);

        // Process message
        for (const message of response.receivedMessageItems) {
            try {
                const hl7Message = parseHL7Message(message.messageText);

                // Generate unique identifiers
                const messageId = hl7Message.messageId || uuidv4();
                const filename = hl7Message.filename || `hl7-${messageId}.txt`;

                // Populate metadata
                const metadata = {
                    AIMSPlatformSender: "Default Sender",
                    AIMSPlatformRecipient: "AIMSPlatform",
                    AIMSPlatformSenderProject: "ELR",
                    AIMSPlatformSenderProtocol: "S3",
                    AIMSPlatformSenderEncryptionType: "KMS",
                    AIMSPlatformFilename: filename,
                    AIMSPlatformSenderMessageId: messageId,
                    Base64Encoded: "False",
                };

                // Upload to AIMS S3 bucket
                const uploadParams = {
                    Bucket: ENV.AIMS_OUTBOUND_ENDPOINT,
                    Key: filename,
                    Body: hl7Message.content,
                    Metadata: metadata,
                    ServerSideEncryption: "aws:kms",
                    SSEKMSKeyId: ENV.AIMS_KMS_ENCRYPTION_KEY,
                };

                await client.upload.promise(); //replace with upload function

                // Successfully uploaded, delete message from queue
                await queueClient.deleteMessage(message.messageId, message.popReceipt);

                context.log(`Successfully processed message ${messageId}`);

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                context.error(`Failed to process message: ${errorMessage}`);
                telemetry.trackEvent({
                    name: "Message processing failed",
                    properties: {
                        operationId,
                        error: errorMessage,
                        messageId: message.messageId,
                    },
                });
            }
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        context.error(`SendToAIMS function failed: ${errorMessage}`);

        telemetry.trackEvent({
            name: "SendToAIMS function failed",
            properties: {
                operationId,
                error: errorMessage,
            },
        });
        throw error;
    }
}

//how to parse the hl7 message?
function parseHL7Message(messageText: string): HL7Message {
 //high level app adds Hl7 message to queue message is just a String, we do not need to parse just populate the body
    // need to confirm message format i.e what metadata need to include. what do they accept as AIMS platform sender.
    return null;
}


const uploadMessageToS3 = async () => {
  // https://youtrack.jetbrains.com/issue/WEB-63867/AWS-SDK-types-are-wrongly-parsed
  // @ts-ignore
  const client = new S3Client({
    credentials: {
      accessKeyId: process.env.AIMS_ACCESS_KEY_ID_TEST,
      secretAccessKey: process.env.AIMS_SECRET_ACCESS_KEY_TEST,
    },
    region: "us-east-1",
  });
  const bucketName = process.env.AIMS_S3_BUCKET_NAME_TEST;
  const fileName = `test-hl7-message-${Date.now()}.hl7`;
  const objectKey = process.env.AIMS_USER_ID_TEST + "/SendTo/" + fileName;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
    Body: exampleMessage, //replace with actual message. The queue item here should be the HL7
    SSEKMSKeyId: process.env.AIMS_KMS_ENCRYPTION_KEY_TEST,
    ServerSideEncryption: "aws:kms",
    Metadata: {
      AIMSPlatformSender: "Dracula Labs", // fac that is sending it. It might be simple Report
      AIMSPlatformRecipient: "AIMSPlatform",
      AIMSPlatformSenderProject: "ELR",
      AIMSPlatformSenderProtocol: "S3",
      AIMSPlatformSenderEncryptionType: "KMS",
      AIMSPlatformFilename: fileName, //object name InterPartner
      // this should match the internal message id
      AIMSPlatformSenderMessageId: "c5e5d0bd-ebe4-4ad2-bbf7-656b1ce63475", // we need to populate this using the file create a function for this
      Base64Encoded: "False"
        //We need to ensure the encoding does not break when we take the message and populating into the json body escape quotes etc. pipe delimter
    } //for testing we need to also read the message
  });

  try {
    // @ts-ignore
    const response = await client.send(command);
    console.log(response);
  } catch (caught) {
    if (
      caught instanceof S3ServiceException &&
      caught.name === "EntityTooLarge"
    ) {
      console.error(
        `Error from S3 while uploading object to ${bucketName}. \
The object was too large. To upload objects larger than 5GB, use the S3 console (160GB max) \
or the multipart upload API (5TB max).`
      );
    } else if (caught instanceof S3ServiceException) {
      console.error(
        `Error from S3 while uploading object to ${bucketName}.  ${caught.name}: ${caught.message}`
      );
    } else {
      throw caught;
    }
  }
};

app.timer("SendToAIMS", {
    schedule: "0 */5 * * * *",
    handler: SendToAIMS,
});
