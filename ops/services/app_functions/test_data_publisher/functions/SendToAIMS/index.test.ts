import { InvocationContext, Timer } from "@azure/functions";
import * as appInsights from "applicationinsights";

// Mock config before importing the main module
jest.mock("../config", () => ({
  ENV: {
    AZ_STORAGE_QUEUE_SVC_URL: "https://test.queue.core.windows.net/",
    AZ_STORAGE_ACCOUNT_NAME: "testaccount",
    AZ_STORAGE_ACCOUNT_KEY: "testkey",
    AIMS_ACCESS_KEY_ID: "testkey",
    AIMS_SECRET_ACCESS_KEY: "testsecret",
    AIMS_KMS_ENCRYPTION_KEY: "testkmskey",
    AIMS_OUTBOUND_ENDPOINT: "test-bucket",
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

jest.mock(
  "applicationinsights",
  jest.fn().mockImplementation(() => ({
    setup: jest.fn(),
    defaultClient: {
      trackEvent: jest.fn(),
      trackDependency: jest.fn(),
    },
  })),
);

jest.mock("@azure/storage-queue", () => ({
  StorageSharedKeyCredential: jest.fn(),
  QueueServiceClient: jest.fn().mockImplementation(() => ({
    getQueueClient: jest.fn().mockReturnValue({
      receiveMessages: jest.fn().mockResolvedValue({
        receivedMessageItems: [],
      }),
    }),
  })),
}));

jest.mock("@aws-sdk/client-s3", () => ({
  S3Client: jest.fn(),
  PutObjectCommand: jest.fn(),
  S3ServiceException: class S3ServiceException extends Error {
    name = "S3ServiceException";
  },
}));

import { SendToAIMS } from "./index";

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
  });

  it("should start successfully and log when no messages are found", async () => {
    await SendToAIMS(timer, context);

    // Should track function start event
    expect(appInsights.defaultClient.trackEvent).toHaveBeenCalledWith({
      name: "SendToAIMS function started",
      properties: {
        operationId: "test-operation-id",
      },
    });

    // Should log checking for messages
    expect(context.log).toHaveBeenCalledWith(
      "Checking for messages in queue...",
    );

    // Should log no messages found
    expect(context.log).toHaveBeenCalledWith("No messages found in queue");
  });
});
