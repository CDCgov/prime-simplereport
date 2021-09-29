import { Context } from "@azure/functions";
import { QueueClient } from "@azure/storage-queue";
import { dequeueMessages, minimumMessagesAvailable } from "./lib";

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

const context: Context = {
  log: jest.fn(),
  traceContext: { traceparent: "asdf" },
} as any;
context.log.error = jest.fn();

describe("lib", () => {
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
});
