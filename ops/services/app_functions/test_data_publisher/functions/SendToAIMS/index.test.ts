import { InvocationContext, Timer } from "@azure/functions";
import * as appInsights from "applicationinsights";
import {
  SendToAIMS,
  formatTimestamp,
  parseHL7Message,
  formatInterPartnerFilename,
} from "./index";

// Mock config
jest.mock("../config", () => ({
  ENV: {
    AZ_STORAGE_QUEUE_SVC_URL: "https://test.queue.core.windows.net/",
    AZ_STORAGE_ACCOUNT_NAME: "testaccount",
    AZ_STORAGE_ACCOUNT_KEY: "testkey",
    AIMS_ACCESS_KEY_ID: "testkey",
    AIMS_SECRET_ACCESS_KEY: "testsecret",
    AIMS_KMS_ENCRYPTION_KEY: "testkmskey",
    AIMS_OUTBOUND_ENDPOINT: "test-bucket",
    AIMS_BUCKET_NAME: "test-bucket",
    AIMS_USER_ID: "test-user",
    AIMS_ENVIRONMENT: "Test",
  },
}));

jest.mock("@azure/functions", () => ({
  ...jest.requireActual("@azure/functions"),
  app: {
    timer: jest.fn(),
  },
}));

jest.mock("applicationinsights", () => {
  const defaultClient = {
    trackEvent: jest.fn(),
    trackDependency: jest.fn(),
    trackException: jest.fn(),
  };
  return {
    setup: jest.fn(() => ({ start: jest.fn() })),
    defaultClient,
  };
});

const mockDeleteMessage = jest.fn();
const mockReceiveMessages = jest.fn();
const mockQueueClient = {
  receiveMessages: mockReceiveMessages,
  deleteMessage: mockDeleteMessage,
};

jest.mock("@azure/storage-queue", () => ({
  StorageSharedKeyCredential: jest.fn(),
  QueueServiceClient: jest.fn().mockImplementation(() => ({
    getQueueClient: jest.fn().mockReturnValue(mockQueueClient),
  })),
}));

const mockS3Send = jest.fn();
const mockS3Client = {
  send: mockS3Send,
};

jest.mock("@aws-sdk/client-s3", () => ({
  S3Client: jest.fn().mockImplementation(() => mockS3Client),
  PutObjectCommand: jest.fn(),
  S3ServiceException: class S3ServiceException extends Error {
    name = "S3ServiceException";
  },
}));

describe("SendToAIMS", () => {
  const context = {
    error: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    traceContext: { traceParent: "test-operation-id" },
  } as jest.MockedObject<InvocationContext>;

  const timer = {} as jest.MockedObject<Timer>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReceiveMessages.mockResolvedValue({ receivedMessageItems: [] });
    mockS3Send.mockResolvedValue({});
    mockDeleteMessage.mockResolvedValue({});
  });

  it("should start successfully and log when no messages are found", async () => {
    await SendToAIMS(timer, context);

    expect(appInsights.defaultClient.trackEvent).toHaveBeenCalledWith({
      name: "SendToAIMS function started",
      properties: {
        operationId: "test-operation-id",
      },
    });

    expect(context.log).toHaveBeenCalledWith(
      "Checking for messages in queue...",
    );

    expect(context.log).toHaveBeenCalledWith("No messages found in queue");
  });

  it("should process messages successfully", async () => {
    const testMessage = {
      messageId: "queue-msg-1",
      popReceipt: "pop-receipt-1",
      messageText:
        "MSH|^~\\&|SimpleReport|Test|AIMS|Prod|20240115103045||ORU^R01|TEST123|T|2.3\nPID|1||123456789|||",
    };

    mockReceiveMessages.mockResolvedValue({
      receivedMessageItems: [testMessage],
    });

    await SendToAIMS(timer, context);

    expect(context.log).toHaveBeenCalledWith("Processing 1 messages");

    expect(mockS3Send).toHaveBeenCalledTimes(1);

    expect(mockDeleteMessage).toHaveBeenCalledWith(
      "queue-msg-1",
      "pop-receipt-1",
    );

    expect(context.log).toHaveBeenCalledWith(
      expect.stringContaining("Successfully processed message TEST123"),
    );

    expect(appInsights.defaultClient.trackEvent).toHaveBeenCalledWith({
      name: "Message successfully processed",
      properties: {
        operationId: "test-operation-id",
        messageId: "TEST123",
        s3Key: expect.stringContaining("test-user/SendTo/"),
      },
    });
  });

  it("should handle S3 upload failures", async () => {
    const testMessage = {
      messageId: "queue-msg-1",
      popReceipt: "pop-receipt-1",
      messageText:
        "MSH|^~\\&|SimpleReport|Test|AIMS|Prod|20240115103045||ORU^R01|TEST123|T|2.3",
    };

    mockReceiveMessages.mockResolvedValue({
      receivedMessageItems: [testMessage],
    });

    const s3Error = new Error("S3 Upload Failed");
    mockS3Send.mockRejectedValue(s3Error);

    await SendToAIMS(timer, context);

    expect(mockDeleteMessage).not.toHaveBeenCalled();

    expect(appInsights.defaultClient.trackException).toHaveBeenCalledWith({
      exception: new Error("SendToAimsError: S3 Upload Failed"),
      properties: {
        operationId: "test-operation-id",
        messageId: "queue-msg-1",
        errorType: "GeneralError",
      },
    });
  });

  it("should handle queue deletion failures after successful S3 upload", async () => {
    const testMessage = {
      messageId: "queue-msg-1",
      popReceipt: "pop-receipt-1",
      messageText:
        "MSH|^~\\&|SimpleReport|Test|AIMS|Prod|20240115103045||ORU^R01|TEST123|T|2.3",
    };

    mockReceiveMessages.mockResolvedValue({
      receivedMessageItems: [testMessage],
    });

    const deleteError = new Error("Queue deletion failed");
    mockDeleteMessage.mockRejectedValue(deleteError);

    await SendToAIMS(timer, context);

    expect(mockS3Send).toHaveBeenCalledTimes(1);

    expect(context.warn).toHaveBeenCalledWith(
      expect.stringContaining(
        "Failed to delete message queue-msg-1 from queue",
      ),
    );

    expect(appInsights.defaultClient.trackEvent).toHaveBeenCalledWith({
      name: "Queue message deletion failed",
      properties: {
        operationId: "test-operation-id",
        messageId: "TEST123",
        error: "Queue deletion failed",
        s3Key: expect.stringContaining("test-user/SendTo/"),
      },
    });
  });

  it("should track large message events", async () => {
    const largeContent =
      "MSH|^~\\&|SimpleReport|Test|AIMS|Prod|20240115103045||ORU^R01|LARGE123|T|2.3\n" +
      "A".repeat(70 * 1024);

    const testMessage = {
      messageId: "queue-msg-1",
      popReceipt: "pop-receipt-1",
      messageText: largeContent,
    };

    mockReceiveMessages.mockResolvedValue({
      receivedMessageItems: [testMessage],
    });

    await SendToAIMS(timer, context);

    expect(context.warn).toHaveBeenCalledWith(
      expect.stringContaining("Large message detected:"),
    );

    expect(appInsights.defaultClient.trackEvent).toHaveBeenCalledWith({
      name: "LargeMessageDetected",
      properties: {
        operationId: "test-operation-id",
        messageId: "LARGE123",
        sizeBytes: expect.any(String),
        threshold: "64KB",
      },
    });
  });

  it("should handle S3 non-200 status codes as failures", async () => {
    const testMessage = {
      messageId: "queue-msg-1",
      popReceipt: "pop-receipt-1",
      messageText:
        "MSH|^~\\&|SimpleReport|Test|AIMS|Prod|20240115103045||ORU^R01|TEST123|T|2.3",
    };

    mockReceiveMessages.mockResolvedValue({
      receivedMessageItems: [testMessage],
    });

    mockS3Send.mockResolvedValue({
      $metadata: { httpStatusCode: 400 },
    });

    await SendToAIMS(timer, context);

    expect(mockDeleteMessage).not.toHaveBeenCalled();

    expect(appInsights.defaultClient.trackException).toHaveBeenCalledWith({
      exception: new Error("SendToAimsError: S3 upload failed with status 400"),
      properties: {
        operationId: "test-operation-id",
        messageId: "queue-msg-1",
        errorType: "GeneralError",
      },
    });

    expect(appInsights.defaultClient.trackEvent).toHaveBeenCalledWith({
      name: "Message processing failed",
      properties: {
        operationId: "test-operation-id",
        messageId: "queue-msg-1",
        errorType: "GeneralError",
        errorMessage: "S3 upload failed with status 400",
      },
    });
  });
});

describe("formatTimestamp", () => {
  it("should format a date to yyyyMMddHHmmssSSS format", () => {
    const date = new Date("2024-01-15T10:30:45.123Z");
    const result = formatTimestamp(date);
    expect(result).toBe("20240115103045123");
  });

  it("should pad single-digit values with zeros", () => {
    const date = new Date("2024-01-05T09:05:03.007Z");
    const result = formatTimestamp(date);
    expect(result).toBe("20240105090503007");
  });

  it("should handle midnight and end of day", () => {
    const midnight = new Date("2024-12-31T00:00:00.000Z");
    const endOfDay = new Date("2024-12-31T23:59:59.999Z");

    expect(formatTimestamp(midnight)).toBe("20241231000000000");
    expect(formatTimestamp(endOfDay)).toBe("20241231235959999");
  });
});

describe("parseHL7Message", () => {
  it("should extract message ID from MSH segment", () => {
    const hl7Content =
      "MSH|^~\\&|SimpleReport|Test|AIMS|Prod|20240115103045||ORU^R01|MSG12345|T|2.3\nPID|1||123456789|||";
    const result = parseHL7Message(hl7Content);

    expect(result.messageId).toBe("MSG12345");
    expect(result.content).toBe(hl7Content);
    expect(result.filename).toContain("MSG12345.hl7");
    expect(result.filename).toContain("InterPartner");
  });

  it("should use fallback message ID when MSH segment not found", () => {
    const hl7Content = "PID|1||123456789|||";
    const result = parseHL7Message(hl7Content);

    expect(result.messageId).toBe("abcd1234messageIDNotFound");
    expect(result.content).toBe(hl7Content);
    expect(result.filename).toContain("hl7-message-");
    expect(result.filename).toContain("InterPartner");
  });

  it("should handle empty message text", () => {
    const result = parseHL7Message("");

    expect(result.messageId).toBe("abcd1234messageIDNotFound");
    expect(result.content).toBe("");
    expect(result.filename).toContain("InterPartner");
  });

  it("should trim whitespace from extracted message ID", () => {
    const hl7Content =
      "MSH|^~\\&|SimpleReport|Test|AIMS|Prod|20240115103045||ORU^R01| MSG12345 |T|2.3\n";
    const result = parseHL7Message(hl7Content);

    expect(result.messageId).toBe("MSG12345");
  });
});

describe("formatInterPartnerFilename", () => {
  it("should format Test environment filename correctly", () => {
    const timestamp = new Date("2024-01-15T10:30:45.123Z");
    const result = formatInterPartnerFilename("Test", timestamp, "test.hl7");

    expect(result).toBe(
      "InterPartner~DatapultELRPivot~Simple-Report~AIMSPlatform~Test~Test~20240115103045123~STOP~test.hl7",
    );
  });

  it("should format Prod environment filename correctly", () => {
    const timestamp = new Date("2024-12-31T23:59:59.999Z");
    const result = formatInterPartnerFilename(
      "Prod",
      timestamp,
      "prod-msg.hl7",
    );

    expect(result).toBe(
      "InterPartner~DatapultELRPivot~Simple-Report~AIMSPlatform~Prod~Prod~20241231235959999~STOP~prod-msg.hl7",
    );
  });
});
