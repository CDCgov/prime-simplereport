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

type Environment = 'Test' | 'Prod';

interface ValidationResult {
    ok: boolean;
    error?: string;
}

function formatInterPartnerFilename(env: Environment, timestamp: Date, sof: string): string {
    // Format: InterPartner~DatapultELRPivot~Simple-Report~AIMSPlatform~<SE>~<RE>~<Timestamp>~STOP~<SOF>
    const uc = "DatapultELRPivot";
    const sj = "Simple-Report";
    const rj = "AIMSPlatform";
    const se = env;
    const re = env;
    const formattedTimestamp = formatTimestamp(timestamp);
    const stop = "STOP";
    
    return `InterPartner~${uc}~${sj}~${rj}~${se}~${re}~${formattedTimestamp}~${stop}~${sof}`;
}

function formatTimestamp(date: Date): string {
    // Format: yyyyMMddHHmmssSSS (17 digits)
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
    
    return `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
}

function validateInterPartnerFilename(filename: string, expectedEnv: Environment): ValidationResult {
    // Format: InterPartner~DatapultELRPivot~Simple-Report~AIMSPlatform~<SE>~<RE>~<Timestamp>~STOP~<SOF>
    const parts = filename.split('~');
    
    if (parts.length !== 9) {
        return { ok: false, error: `Expected 9 tilde-delimited parts, got ${parts.length}` };
    }
    
    const [prefix, uc, sj, rj, se, re, timestamp, stop, sof] = parts;
    
    // Validate each part
    if (prefix !== "InterPartner") {
        return { ok: false, error: `Expected prefix "InterPartner", got "${prefix}"` };
    }
    
    if (uc !== "DatapultELRPivot") {
        return { ok: false, error: `Expected UC "DatapultELRPivot", got "${uc}"` };
    }
    
    if (sj !== "Simple-Report") {
        return { ok: false, error: `Expected SJ "Simple-Report", got "${sj}"` };
    }
    
    if (rj !== "AIMSPlatform") {
        return { ok: false, error: `Expected RJ "AIMSPlatform", got "${rj}"` };
    }
    
    if (se !== expectedEnv) {
        return { ok: false, error: `Expected SE "${expectedEnv}", got "${se}"` };
    }
    
    if (re !== expectedEnv) {
        return { ok: false, error: `Expected RE "${expectedEnv}", got "${re}"` };
    }
    
    // Validate timestamp format (yyyyMMddHHmmssSSS - 17 digits)
    if (!/^\d{17}$/.test(timestamp)) {
        return { ok: false, error: `Expected 17-digit timestamp, got "${timestamp}"` };
    }
    
    if (stop !== "STOP") {
        return { ok: false, error: `Expected "STOP", got "${stop}"` };
    }
    
    if (!sof.endsWith('.hl7')) {
        return { ok: false, error: `Expected SOF to end with ".hl7", got "${sof}"` };
    }
    
    return { ok: true };
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
            ENV.AZ_STORAGE_ACCOUNT_KEY
        );
        // pull client
        const queueServiceClient = new QueueServiceClient(
            ENV.AZ_STORAGE_QUEUE_SVC_URL,
            sharedKeyCredential
        );


        const queueClient = queueServiceClient.getQueueClient("hl7v2-data-publishing");

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
                // Generate identifiers
                const messageId = hl7Message.messageId || uuidv4();
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
                    Bucket: ENV.AIMS_OUTBOUND_ENDPOINT,
                    Key: objectKey,
                    Body: hl7Message.content,
                    Metadata: metadata,
                    ServerSideEncryption: "aws:kms" as const,
                    SSEKMSKeyId: ENV.AIMS_KMS_ENCRYPTION_KEY,
                };

                const command = new PutObjectCommand(uploadParams);
                await client.send(command);

                // Delete message from queue only after successful S3 upload
                await queueClient.deleteMessage(message.messageId, message.popReceipt);

                context.log(`Successfully processed message ${messageId} and uploaded to S3 key: ${objectKey}`);
                
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
                            "The message was too large. Maximum size is 5GB."
                        );
                    } else {
                        context.error(
                            `Error from S3 while uploading message ${message.messageId}. ${error.name}: ${error.message}`
                        );
                    }
                } else {
                    context.error(`Failed to process message ${message.messageId}: ${errorMessage}`);
                }
                
                telemetry.trackEvent({
                    name: "Message processing failed",
                    properties: {
                        operationId,
                        error: errorMessage,
                        messageId: message.messageId,
                        errorType: error instanceof S3ServiceException ? "S3Error" : "GeneralError",
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

function parseHL7Message(messageText: string): HL7Message {
    // Extract message ID from HL7 MSH segment (10th field)
    let messageId = uuidv4();
    let baseFilename = `hl7-message-${Date.now()}.hl7`;
    
    if (messageText) {
        // Find the MSH segment (first line)
        const lines = messageText.split('\n');
        const mshLine = lines.find(line => line.startsWith('MSH|'));
        
        if (mshLine) {
            // Split by | delimiter to get fields
            const fields = mshLine.split('|');
            if (fields.length > 9 && fields[9].trim()) {
                messageId = fields[9].trim();
                baseFilename = `${messageId}.hl7`;
            }
        }
    }
    
    // Generate InterPartner formatted filename
    const env = ENV.AIMS_ENVIRONMENT as Environment;
    const timestamp = new Date();
    const interPartnerFilename = formatInterPartnerFilename(env, timestamp, baseFilename);
    
    return {
        content: messageText || '',
        messageId,
        filename: interPartnerFilename
    };
}

app.timer("SendToAIMS", {
    schedule: "0 */5 * * * *",
    handler: SendToAIMS,
});
