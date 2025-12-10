import { InvocationContext } from "@azure/functions";

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

// Mock config
jest.mock("../config", () => ({
  ENV: {
    AIMS_BUCKET_NAME: "test-bucket",
    AIMS_USER_ID: "test-user",
    AIMS_KMS_ENCRYPTION_KEY: "test-kms-key",
    AIMS_ENVIRONMENT: "Test",
  },
}));

// Mock telemetry
const mockTrackEvent = jest.fn();
const mockTrackDependency = jest.fn();
const mockTrackException = jest.fn();

jest.mock("./telemetry", () => ({
  getTelemetry: jest.fn(() => ({
    trackEvent: mockTrackEvent,
    trackDependency: mockTrackDependency,
    trackException: mockTrackException,
  })),
}));

// Mock hl7utils
jest.mock("./hl7utils", () => ({
  parseHL7Message: jest.fn(),
}));

// Import modules after mocks
import { processMessage } from "./messageProcessor";
import { parseHL7Message } from "./hl7utils";

const mockParseHL7Message = parseHL7Message as jest.MockedFunction<
  typeof parseHL7Message
>;

describe("messageProcessor", () => {
  const mockQueueClient = {
    deleteMessage: jest.fn(),
  };

  const mockContext = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as jest.MockedObject<InvocationContext>;

  const testMessage = {
    messageId: "queue-msg-1",
    popReceipt: "pop-receipt-1",
    messageText: Buffer.from(
      "MSH|^~\\&|SimpleReport|Test|AIMS|Prod|20240115103045||ORU^R01|TEST123|T|2.3",
      "utf8",
    ).toString("base64"),
  };

  const mockHL7Message = {
    messageId: "TEST123",
    filename:
      "InterPartner~ExpandedELR~Simple-Report~AIMSPlatform~Test~Test~20240115103045123~STOP~TEST123.hl7",
    content: testMessage.messageText,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockParseHL7Message.mockReturnValue(mockHL7Message);
    mockS3Send.mockResolvedValue({ $metadata: { httpStatusCode: 200 } });
    mockQueueClient.deleteMessage.mockResolvedValue(undefined);
  });

  it("should process message successfully", async () => {
    await processMessage({
      message: testMessage,
      queueClient: mockQueueClient as any,
      s3Client: mockS3Client as any,
      context: mockContext,
      operationId: "test-op-id",
    });

    expect(mockParseHL7Message).toHaveBeenCalledWith(
      Buffer.from(testMessage.messageText, "base64").toString("utf8"),
    );
    expect(mockS3Send).toHaveBeenCalledTimes(1);
    expect(mockQueueClient.deleteMessage).toHaveBeenCalledWith(
      "queue-msg-1",
      "pop-receipt-1",
    );

    expect(mockTrackEvent).toHaveBeenCalledWith({
      name: "Message successfully processed",
      properties: {
        operationId: "test-op-id",
        messageId: "TEST123",
        s3Key:
          "test-user/SendTo/InterPartner~ExpandedELR~Simple-Report~AIMSPlatform~Test~Test~20240115103045123~STOP~TEST123.hl7",
      },
    });

    expect(mockContext.log).toHaveBeenCalledWith(
      expect.stringContaining("Successfully processed message TEST123"),
    );
  });

  it("should track message size and warn for large messages", async () => {
    const largeMessage = {
      ...testMessage,
      messageText: Buffer.from(
        Buffer.from(testMessage.messageText, "base64").toString("utf8") +
          "A".repeat(70 * 1024),
        "utf8",
      ).toString("base64"),
    };

    await processMessage({
      message: largeMessage,
      queueClient: mockQueueClient as any,
      s3Client: mockS3Client as any,
      context: mockContext,
      operationId: "test-op-id",
    });

    expect(mockTrackEvent).toHaveBeenCalledWith({
      name: "MessageSizeObserved",
      properties: { bytes: expect.any(String) },
    });

    expect(mockTrackEvent).toHaveBeenCalledWith({
      name: "LargeMessageDetected",
      properties: {
        operationId: "test-op-id",
        messageId: "TEST123",
        sizeBytes: expect.any(String),
        threshold: "64KB",
      },
    });

    expect(mockContext.warn).toHaveBeenCalledWith(
      expect.stringContaining("Large message detected:"),
    );
  });

  it("should handle S3 upload failures", async () => {
    const s3Error = new Error("S3 Upload Failed");
    mockS3Send.mockRejectedValue(s3Error);

    await expect(
      processMessage({
        message: testMessage,
        queueClient: mockQueueClient as any,
        s3Client: mockS3Client as any,
        context: mockContext,
        operationId: "test-op-id",
      }),
    ).rejects.toThrow("S3 Upload Failed");

    expect(mockQueueClient.deleteMessage).not.toHaveBeenCalled();

    expect(mockTrackException).toHaveBeenCalledWith({
      exception: new Error("SendToAimsError: S3 Upload Failed"),
      properties: {
        operationId: "test-op-id",
        messageId: "queue-msg-1",
        errorType: "GeneralError",
      },
    });

    expect(mockContext.error).toHaveBeenCalledWith(
      "Failed to process message queue-msg-1: S3 Upload Failed",
    );
  });

  it("should handle S3 >=400 status codes", async () => {
    mockS3Send.mockResolvedValue({ $metadata: { httpStatusCode: 400 } });

    await expect(
      processMessage({
        message: testMessage,
        queueClient: mockQueueClient as any,
        s3Client: mockS3Client as any,
        context: mockContext,
        operationId: "test-op-id",
      }),
    ).rejects.toThrow("S3 upload failed with status 400");

    expect(mockTrackDependency).toHaveBeenCalledWith({
      name: "S3 PutObject",
      data: expect.any(String),
      duration: expect.any(Number),
      success: false,
      dependencyTypeName: "S3",
    });
  });

  it("should handle queue deletion failures gracefully", async () => {
    const deleteError = new Error("Queue deletion failed");
    mockQueueClient.deleteMessage.mockRejectedValue(deleteError);

    await processMessage({
      message: testMessage,
      queueClient: mockQueueClient as any,
      s3Client: mockS3Client as any,
      context: mockContext,
      operationId: "test-op-id",
    });

    expect(mockS3Send).toHaveBeenCalledTimes(1);

    expect(mockContext.warn).toHaveBeenCalledWith(
      expect.stringContaining(
        "Failed to delete message queue-msg-1 from queue",
      ),
    );

    expect(mockTrackEvent).toHaveBeenCalledWith({
      name: "Queue message deletion failed",
      properties: {
        operationId: "test-op-id",
        messageId: "TEST123",
        error: "Queue deletion failed",
        s3Key: expect.any(String),
      },
    });
  });

  it("should handle HL7 parsing failures", async () => {
    mockParseHL7Message.mockImplementation(() => {
      throw new Error("Invalid HL7 message");
    });

    await expect(
      processMessage({
        message: testMessage,
        queueClient: mockQueueClient as any,
        s3Client: mockS3Client as any,
        context: mockContext,
        operationId: "test-op-id",
      }),
    ).rejects.toThrow("Invalid HL7 message");

    expect(mockS3Send).not.toHaveBeenCalled();
    expect(mockQueueClient.deleteMessage).not.toHaveBeenCalled();

    expect(mockContext.error).toHaveBeenCalledWith(
      "Failed to process message queue-msg-1: Invalid HL7 message",
    );
  });

  it("should track successful S3 dependency", async () => {
    await processMessage({
      message: testMessage,
      queueClient: mockQueueClient as any,
      s3Client: mockS3Client as any,
      context: mockContext,
      operationId: "test-op-id",
    });

    expect(mockTrackDependency).toHaveBeenCalledWith({
      name: "S3 PutObject",
      data: expect.stringContaining("test-user/SendTo/"),
      duration: expect.any(Number),
      success: true,
      dependencyTypeName: "S3",
    });
  });
});
