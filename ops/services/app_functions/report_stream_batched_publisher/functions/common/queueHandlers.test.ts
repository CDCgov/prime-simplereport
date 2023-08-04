import {
  deleteSuccessfullyParsedMessages,
  dequeueMessages,
  getQueueClient,
  getTestEventIdFromFHIRBundle,
  minimumMessagesAvailable,
  reportExceptions,
} from "./queueHandlers";
import {
  DequeuedMessageItem,
  QueueClient,
  QueueDeleteMessageResponse,
  QueueServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-queue";
import { ReportStreamError, ReportStreamResponse } from "./types";
import { Context } from "@azure/functions";

jest.mock("../config", () => ({
  ENV: {
    AZ_STORAGE_QUEUE_SVC_URL: "hello",
    AZ_STORAGE_ACCOUNT_NAME: "hola",
    AZ_STORAGE_ACCOUNT_KEY: "bonjour",
    TEST_EVENT_QUEUE_NAME: "ciao",
    REPORT_STREAM_BATCH_MINIMUM: "1",
    REPORT_STREAM_BATCH_MAXIMUM: "5000",
  },
}));

jest.mock("@azure/storage-queue");

const queueServiceClientMock = QueueServiceClient as jest.MockedClass<
  typeof QueueServiceClient
>;
const storageSharedKeyCredentialMock =
  StorageSharedKeyCredential as jest.MockedClass<
    typeof StorageSharedKeyCredential
  >;

const context = {
  log: jest.fn(),
  traceContext: { traceparent: "asdf" },
} as jest.MockedObject<Context>;
context.log.error = jest.fn();

describe("Queue Handlers", () => {
  describe("getQueueClient", () => {
    it("creates a StorageSharedKeyCredential and QueueServiceClient", async () => {
      // WHEN
      getQueueClient("whatever");

      // THEN
      expect(queueServiceClientMock).toHaveBeenCalledTimes(1);
      expect(storageSharedKeyCredentialMock).toHaveBeenCalledTimes(1);
    });

    it("is memoized", async () => {
      // WHEN
      getQueueClient("whatever");
      getQueueClient("whatever");
      getQueueClient("whatever");

      // THEN
      expect(queueServiceClientMock).toHaveBeenCalledTimes(1);
      expect(storageSharedKeyCredentialMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("minimumMessagesAvailable", () => {
    it("returns false for 0 messages", async () => {
      // GIVEN
      const queueClientMock = {
        getProperties: jest.fn().mockResolvedValue({
          approximateMessagesCount: 0,
        }),
      } as jest.MockedObject<QueueClient>;

      // WHEN
      const result = await minimumMessagesAvailable(context, queueClientMock);

      // THEN
      expect(queueClientMock.getProperties).toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it("returns false for undefined messages", async () => {
      // GIVEN
      const queueClientMock = {
        getProperties: jest.fn().mockResolvedValue({}),
      } as jest.MockedObject<QueueClient>;

      // WHEN
      const result = await minimumMessagesAvailable(context, queueClientMock);

      // THEN
      expect(queueClientMock.getProperties).toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it("returns true for > config messages", async () => {
      // GIVEN
      const queueClientMock = {
        getProperties: jest.fn().mockResolvedValue({
          approximateMessagesCount: 10,
        }),
      } as jest.MockedObject<QueueClient>;

      // WHEN
      const result = await minimumMessagesAvailable(context, queueClientMock);

      // THEN
      expect(queueClientMock.getProperties).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe("dequeueMessages", () => {
    it("calls receiveMessages until the queue is depleted", async () => {
      // GIVEN
      const queueClientMock = {
        receiveMessages: jest
          .fn()
          .mockResolvedValue({
            receivedMessageItems: [],
          })
          .mockResolvedValueOnce({
            receivedMessageItems: [1, 2, 3],
          })
          .mockResolvedValueOnce({
            receivedMessageItems: [1, 2, 3],
          }),
      } as jest.MockedObject<QueueClient>;

      // WHEN
      const result = await dequeueMessages(context, queueClientMock);

      // THEN
      expect(queueClientMock.receiveMessages).toHaveBeenCalledTimes(3);
      expect(result.length).toBe(6);
    });

    it("doesn't care if receiveMessage has a transient failure", async () => {
      // GIVEN
      const queueClientMock = {
        receiveMessages: jest
          .fn()
          .mockResolvedValue({
            receivedMessageItems: [],
          })
          .mockResolvedValueOnce({
            receivedMessageItems: [1, 2, 3],
          })
          .mockImplementationOnce(() => {
            throw "oh no";
          })
          .mockResolvedValueOnce({
            receivedMessageItems: [1, 2],
          }),
      } as jest.MockedObject<QueueClient>;

      // WHEN
      const result = await dequeueMessages(context, queueClientMock);

      // THEN
      expect(queueClientMock.receiveMessages).toHaveBeenCalledTimes(4);
      expect(result.length).toBe(5);
    });
  });

  describe("deleteSuccessfullyParsedMessages", () => {
    it("calls queueClient.deleteMessage appropriately", async () => {
      // GIVEN
      const queueClientMock = {
        deleteMessage: jest.fn().mockResolvedValue(true),
        name: "dummyTestEventQueue",
      } as jest.MockedObject<QueueClient>;
      const messages: DequeuedMessageItem[] = [
        {
          messageId: "1234",
          popReceipt: "abcd",
          messageText: '{"Result_ID" : 1}',
        },
        {
          messageId: "1234",
          popReceipt: "abcd",
          messageText: '{"Result_ID" : 2}',
        },
        {
          messageId: "1234",
          popReceipt: "abcd",
          messageText: '{"Result_ID" : 3}',
        },
      ] as jest.Mocked<DequeuedMessageItem>[];

      // WHEN
      await deleteSuccessfullyParsedMessages(
        context,
        queueClientMock,
        messages,
        {},
      );

      // THEN
      expect(queueClientMock.deleteMessage).toHaveBeenCalledTimes(
        messages.length,
      );
    });

    it("doesn't call queueClient.deleteMessage for parse failures", async () => {
      // GIVEN
      const queueClientMock = {
        name: "dummyTestEventQueue",
        deleteMessage: jest.fn().mockResolvedValue({
          requestId: "123",
        } as QueueDeleteMessageResponse),
      } as jest.MockedObject<QueueClient>;

      const messages = [
        {
          messageId: "apple",
          popReceipt: "abcd",
          messageText: '{"Result_ID" : 11}',
        },
        {
          messageId: "grape",
          popReceipt: "efgh",
          messageText: '{"Result_ID" : 33}',
        },
        {
          messageId: "banana",
          popReceipt: "ijkl",
          messageText: '{"Result_ID" : 22}',
        },
      ] as jest.Mocked<DequeuedMessageItem>[];
      const parseFailure = {
        grape: true,
      };

      // WHEN
      await deleteSuccessfullyParsedMessages(
        context,
        queueClientMock,
        messages,
        parseFailure,
      );

      // THEN
      expect(queueClientMock.deleteMessage).toHaveBeenCalledTimes(
        messages.length - 1,
      );
      expect(queueClientMock.deleteMessage).toHaveBeenCalledWith(
        "apple",
        "abcd",
      );
      expect(queueClientMock.deleteMessage).toHaveBeenCalledWith(
        "banana",
        "ijkl",
      );
      expect(queueClientMock.deleteMessage).not.toHaveBeenCalledWith(
        "grape",
        "efgh",
      );

      expect(context.log).toHaveBeenCalledWith(
        "Queue: dummyTestEventQueue. Message grape failed to parse; skipping deletion",
      );
      expect(context.log).toHaveBeenCalledWith(
        "Queue: dummyTestEventQueue. Message apple deleted with request id 123 and has TestEvent id 11",
      );
      expect(context.log).toHaveBeenCalledWith(
        "Queue: dummyTestEventQueue. Message banana deleted with request id 123 and has TestEvent id 22",
      );
    });
  });

  describe("reportExceptions", () => {
    it("produces sendMessage promises for warnings", async () => {
      // GIVEN
      const warnings = [
        {
          trackingIds: ["1234"],
          message: "hello",
          scope: "item",
        },
        {
          trackingIds: ["1234"],
          message: "hello",
          scope: "item",
        },
        {
          trackingIds: ["1234"],
          message: "hello",
          scope: "item",
        },
      ];
      const response: ReportStreamResponse = {
        errorCount: 0,
        errors: [],
        warningCount: warnings.length,
        warnings,
      } as jest.Mocked<ReportStreamResponse>;
      const queueClientMock = {
        name: "dummyTestEventQueue",
        sendMessage: jest.fn().mockResolvedValue(true),
      } as jest.MockedObject<QueueClient>;

      // WHEN
      await reportExceptions(
        context,
        queueClientMock,
        response,
        "dummyTestEventQueue",
      );

      // THEN
      expect(queueClientMock.sendMessage).toHaveBeenCalledTimes(
        warnings.length,
      );
    });

    it("produces sendMessage promises for errors", async () => {
      // GIVEN
      const warnings = [
        {
          trackingIds: ["1234"],
          message: "hello",
          scope: "item",
        },
        {
          trackingIds: ["1234"],
          message: "hello",
          scope: "item",
        },
        {
          trackingIds: ["1234"],
          message: "hello",
          scope: "item",
        },
      ];
      const errors: ReportStreamError[] = [
        {
          trackingIds: ["1234"],
          message: "hello",
          scope: "item",
        },
        {
          trackingIds: ["1234"],
          message: "hello",
          scope: "item",
        },
      ];
      const response = {
        errorCount: errors.length,
        errors,
        warningCount: warnings.length,
        warnings,
      } as jest.Mocked<ReportStreamResponse>;
      const queueClientMock = {
        name: "dummyTestEventQueue",
        sendMessage: jest.fn().mockResolvedValue(true),
      } as jest.MockedObject<QueueClient>;

      // WHEN
      await reportExceptions(
        context,
        queueClientMock,
        response,
        "dummyTestEventQueue",
      );

      // THEN
      expect(queueClientMock.sendMessage).toHaveBeenCalledTimes(
        warnings.length + errors.length,
      );
    });

    it("sends messages per item for item-scoped exceptions and none for report-scoped exceptions", async () => {
      const warnings: ReportStreamError[] = [
        {
          trackingIds: ["1234", "5678"],
          message: "goodbye",
          scope: "item",
        },
        {
          trackingIds: ["1234"],
          message: "au revoir",
          scope: "item",
        },
        {
          message: "ha det bra",
          scope: "report",
        },
      ];
      const errors: ReportStreamError[] = [
        {
          trackingIds: ["1234"],
          message: "adios",
          scope: "item",
        },
        {
          message: "arrivederci",
          scope: "report",
        },
        {
          trackingIds: ["1234", "91011"],
          message: "auf wiedersehen",
          scope: "item",
        },
      ];
      const response = {
        errorCount: errors.length,
        errors,
        warningCount: warnings.length,
        warnings,
      } as jest.Mocked<ReportStreamResponse>;
      const queueClientMock = {
        name: "dummyTestEventQueue",
        sendMessage: jest.fn().mockResolvedValue(true),
      } as jest.MockedObject<QueueClient>;

      // WHEN
      await reportExceptions(
        context,
        queueClientMock,
        response,
        "dummyTestEventQueue",
      );

      // THEN
      expect(queueClientMock.sendMessage).toHaveBeenCalledTimes(6);
      const expectedMessages = [
        `{"testEventInternalId":"1234","isError":false,"details":"goodbye","queueName":"dummyTestEventQueue"}`,
        `{"testEventInternalId":"5678","isError":false,"details":"goodbye","queueName":"dummyTestEventQueue"}`,
        `{"testEventInternalId":"1234","isError":false,"details":"au revoir","queueName":"dummyTestEventQueue"}`,
        `{"testEventInternalId":"1234","isError":true,"details":"adios","queueName":"dummyTestEventQueue"}`,
        `{"testEventInternalId":"1234","isError":true,"details":"auf wiedersehen","queueName":"dummyTestEventQueue"}`,
        `{"testEventInternalId":"91011","isError":true,"details":"auf wiedersehen","queueName":"dummyTestEventQueue"}`,
      ];
      expectedMessages.forEach((em) => {
        expect(queueClientMock.sendMessage).toHaveBeenCalledWith(
          Buffer.from(em).toString("base64"),
        );
      });
    });
  });

  describe("getTestEventIdFromFHIRBundle", () => {
    it("returns undefined when no bundle is passed", () => {
      expect(getTestEventIdFromFHIRBundle(undefined)).toBeUndefined();
    });

    it("returns undefined when invalid bundle is passed", () => {
      expect(getTestEventIdFromFHIRBundle({ not: "fhir" })).toBeUndefined();
    });

    it("returns undefined when bundle does not contain test id", () => {
      expect(
        getTestEventIdFromFHIRBundle({
          entry: [
            { resource: { resourceType: "not_DiagnosticReport", id: "123" } },
            { resource: { resourceType: "DiagnosticReport" } },
          ],
        }),
      ).toBeUndefined();
    });

    it("returns correct test id", () => {
      expect(
        getTestEventIdFromFHIRBundle({
          entry: [
            { resource: { resourceType: "DiagnosticReport", id: "123" } },
          ],
        }),
      ).toEqual("123");
    });
  });
});
