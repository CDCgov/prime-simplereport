import { InvocationContext, Timer } from "@azure/functions";
import * as appInsights from "applicationinsights";

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

const mockProcessMessage = jest.fn();
jest.mock("./messageProcessor", () => ({
  processMessage: mockProcessMessage,
}));

import { SendToAIMS } from "./index";
import {
  formatTimestamp,
  parseHL7Message,
  formatInterPartnerFilename,
} from "./hl7utils";

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
    mockProcessMessage.mockResolvedValue(undefined);
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

    expect(mockProcessMessage).toHaveBeenCalledTimes(1);
    expect(mockProcessMessage).toHaveBeenCalledWith({
      message: testMessage,
      queueClient: mockQueueClient,
      s3Client: expect.any(Object),
      context,
      operationId: "test-operation-id",
    });
  });

  it("should handle message processing failures", async () => {
    const testMessage = {
      messageId: "queue-msg-1",
      popReceipt: "pop-receipt-1",
      messageText:
        "MSH|^~\\&|SimpleReport|Test|AIMS|Prod|20240115103045||ORU^R01|TEST123|T|2.3",
    };

    mockReceiveMessages.mockResolvedValue({
      receivedMessageItems: [testMessage],
    });

    const processingError = new Error("Message processing failed");
    mockProcessMessage.mockRejectedValue(processingError);

    await SendToAIMS(timer, context);

    expect(mockProcessMessage).toHaveBeenCalledTimes(1);
    expect(mockProcessMessage).toHaveBeenCalledWith({
      message: testMessage,
      queueClient: mockQueueClient,
      s3Client: expect.any(Object),
      context,
      operationId: "test-operation-id",
    });
  });

  it("should process multiple messages", async () => {
    const testMessages = [
      {
        messageId: "queue-msg-1",
        popReceipt: "pop-receipt-1",
        messageText:
          "MSH|^~\\&|SimpleReport|Test|AIMS|Prod|20240115103045||ORU^R01|TEST123|T|2.3",
      },
      {
        messageId: "queue-msg-2",
        popReceipt: "pop-receipt-2",
        messageText:
          "MSH|^~\\&|SimpleReport|Test|AIMS|Prod|20240115103045||ORU^R01|TEST456|T|2.3",
      },
    ];

    mockReceiveMessages.mockResolvedValue({
      receivedMessageItems: testMessages,
    });

    await SendToAIMS(timer, context);

    expect(context.log).toHaveBeenCalledWith("Processing 2 messages");
    expect(mockProcessMessage).toHaveBeenCalledTimes(2);
  });

  it("should continue processing after a message fails", async () => {
    const msg1 = {
      messageId: "queue-msg-1",
      popReceipt: "pop-receipt-1",
      messageText:
        "MSH|^~\\&|SimpleReport|Test|AIMS|Prod|20240115103045||ORU^R01|TEST123|T|2.3",
    };
    const msg2 = {
      messageId: "queue-msg-2",
      popReceipt: "pop-receipt-2",
      messageText:
        "MSH|^~\\&|SimpleReport|Test|AIMS|Prod|20240115103045||ORU^R01|TEST456|T|2.3",
    };

    mockReceiveMessages.mockResolvedValue({
      receivedMessageItems: [msg1, msg2],
    });

    mockProcessMessage
      .mockRejectedValueOnce(new Error("broken which is ok!"))
      .mockResolvedValueOnce(undefined);

    await SendToAIMS(timer, context);

    expect(mockProcessMessage).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ message: msg2 }),
    );
    expect(mockProcessMessage).toHaveBeenCalledTimes(2);
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

  it("should throw error when MSH segment not found", () => {
    const hl7Content = "PID|1||123456789|||";

    expect(() => parseHL7Message(hl7Content)).toThrow(
      "Invalid message: unable to parse message ID from HL7 MSH segment",
    );
  });

  it("should throw error for empty message text", () => {
    expect(() => parseHL7Message("")).toThrow(
      "Invalid message: empty message text",
    );
  });

  it("should throw error for null/undefined message text", () => {
    expect(() => parseHL7Message(null as any)).toThrow(
      "Invalid message: empty message text",
    );
    expect(() => parseHL7Message(undefined as any)).toThrow(
      "Invalid message: empty message text",
    );
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
      "InterPartner~ExpandedELR~Simple-Report~AIMSPlatform~Test~Test~20240115103045123~STOP~test.hl7",
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
      "InterPartner~ExpandedELR~Simple-Report~AIMSPlatform~Prod~Prod~20241231235959999~STOP~prod-msg.hl7",
    );
  });
});
