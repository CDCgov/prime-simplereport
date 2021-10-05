import { Context } from "@azure/functions";
import { DequeuedMessageItem, QueueClient, QueueServiceClient, StorageSharedKeyCredential } from "@azure/storage-queue";
import {
  deleteSuccessfullyParsedMessages,
  dequeueMessages,
  getQueueClient,
  minimumMessagesAvailable,
  reportExceptions,
} from "./lib";
import { ReportStreamError, ReportStreamResponse } from "./rs-response";

jest.mock("./config", () => ({
  ENV: {
    AZ_STORAGE_QUEUE_SVC_URL: "hello",
    AZ_STORAGE_ACCOUNT_NAME: "hola",
    AZ_STORAGE_ACCOUNT_KEY: "bonjour",
    TEST_EVENT_QUEUE_NAME: "ciao",
    REPORT_STREAM_URL: "https://nope.url/1234",
    REPORT_STREAM_TOKEN: "merhaba",
    REPORT_STREAM_BATCH_MINIMUM: "1",
    REPORT_STREAM_BATCH_MAXIMUM: "5000",
  },
}));

const queueServiceClientMock = QueueServiceClient as jest.MockedClass<typeof QueueServiceClient>;
const storageSharedKeyCredentialMock = StorageSharedKeyCredential as jest.MockedClass<typeof StorageSharedKeyCredential>;
jest.mock("@azure/storage-queue"); 

const context: Context = {
  log: jest.fn(),
  traceContext: { traceparent: "asdf" },
} as any;
context.log.error = jest.fn();

describe("lib", () => {
  describe('getQueueClient', () => {
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
    })
  })


  describe("minimumMessagesAvailable", () => {
    it("returns false for 0 messages", async () => {
      // GIVEN
      const queueClientMock: QueueClient = {
        getProperties: jest.fn().mockResolvedValue({
          approximateMessagesCount: 0,
        }),
      } as any;

      // WHEN
      const result = await minimumMessagesAvailable(context, queueClientMock);

      // THEN
      expect(queueClientMock.getProperties).toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it("returns false for undefined messages", async () => {
      // GIVEN
      const queueClientMock: QueueClient = {
        getProperties: jest.fn().mockResolvedValue({}),
      } as any;

      // WHEN
      const result = await minimumMessagesAvailable(context, queueClientMock);

      // THEN
      expect(queueClientMock.getProperties).toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it("returns true for > config messages", async () => {
      // GIVEN
      const queueClientMock: QueueClient = {
        getProperties: jest.fn().mockResolvedValue({
          approximateMessagesCount: 10,
        }),
      } as any;

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
      const queueClientMock: QueueClient = {
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
      } as any;

      // WHEN
      const result = await dequeueMessages(context, queueClientMock);

      // THEN
      expect(queueClientMock.receiveMessages).toHaveBeenCalledTimes(3);
      expect(result.length).toBe(6);
    });

    it("doesn't care if receiveMessage has a transient failure", async () => {
      // GIVEN
      const queueClientMock: QueueClient = {
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
      } as any;

      // WHEN
      const result = await dequeueMessages(context, queueClientMock);

      // THEN
      expect(queueClientMock.receiveMessages).toHaveBeenCalledTimes(4);
      expect(result.length).toBe(5);
    });
  });

  describe("deleteSuccessfullyParsedMessages", () => {
    it('calls queueClient.deleteMessage appropriately', async () => {
      // GIVEN
      const queueClientMock: QueueClient = {
        deleteMessage: jest.fn().mockResolvedValue(true),
      } as any; 
      const messages: DequeuedMessageItem[] = [{
        messageId: '1234',
        popReceipt: 'abcd'
      },{
        messageId: '1234',
        popReceipt: 'abcd'
      },{
        messageId: '1234',
        popReceipt: 'abcd'
      }] as any;

      // WHEN
      await deleteSuccessfullyParsedMessages(context, queueClientMock, messages, {});
      
      // THEN
      expect(queueClientMock.deleteMessage).toHaveBeenCalledTimes(messages.length);
    });

    it("does't call queueClient.deleteMessage for parse failures", async () => {
      // GIVEN
      const queueClientMock: QueueClient = {
        deleteMessage: jest.fn().mockResolvedValue(true),
      } as any; 
      const messages: DequeuedMessageItem[] = [{
        messageId: 'apple',
        popReceipt: 'abcd'
      },{
        messageId: 'banana',
        popReceipt: 'abcd'
      },{
        messageId: 'grape',
        popReceipt: 'abcd'
      }] as any;
      const parseFailure = {
        'grape': true
      };

      // WHEN
      await deleteSuccessfullyParsedMessages(context, queueClientMock, messages, parseFailure);
      
      // THEN
      expect(queueClientMock.deleteMessage).toHaveBeenCalledTimes(messages.length - 1);
      expect(queueClientMock.deleteMessage).not.toHaveBeenCalledWith('grape');
    });
  });

  describe("reportExceptions", () => {
    it("produces sendMessage promises for warnings", async () => {
      // GIVEN
      const warnings: ReportStreamError[] = [
        {
          id: "1234",
          details: "hello",
          scope: "ITEM",
        },
        {
          id: "1234",
          details: "hello",
          scope: "ITEM",
        },
        {
          id: "1234",
          details: "hello",
          scope: "ITEM",
        },
      ];
      const response: ReportStreamResponse = {
        errorCount: 0,
        errors: [],
        warningCount: warnings.length,
        warnings,
      } as any;
      const queueClientMock: QueueClient = {
        sendMessage: jest.fn().mockResolvedValue(true),
      } as any;

      // WHEN
      await reportExceptions(context, queueClientMock, response);

      // THEN
      expect(queueClientMock.sendMessage).toHaveBeenCalledTimes(
        warnings.length
      );
    });

    it("produces sendMessage promises for errors", async () => {
      // GIVEN
      const warnings: ReportStreamError[] = [
        {
          id: "1234",
          details: "hello",
          scope: "ITEM",
        },
        {
          id: "1234",
          details: "hello",
          scope: "ITEM",
        },
        {
          id: "1234",
          details: "hello",
          scope: "ITEM",
        },
      ];
      const errors: ReportStreamError[] = [
        {
          id: "1234",
          details: "hello",
          scope: "ITEM",
        },
        {
          id: "1234",
          details: "hello",
          scope: "ITEM",
        },
      ];
      const response: ReportStreamResponse = {
        errorCount: errors.length,
        errors,
        warningCount: warnings.length,
        warnings,
      } as any;
      const queueClientMock: QueueClient = {
        sendMessage: jest.fn().mockResolvedValue(true),
      } as any;

      // WHEN
      await reportExceptions(context, queueClientMock, response);

      // THEN
      expect(queueClientMock.sendMessage).toHaveBeenCalledTimes(
        warnings.length + errors.length
      );
    });
  });
});
