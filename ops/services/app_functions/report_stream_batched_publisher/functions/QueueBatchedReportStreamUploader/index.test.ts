import fn from "./index";
import * as lib from "./lib";
import * as queueHandlers from "../common/queueHandlers";
import * as appInsights from "applicationinsights";
import { Context } from "@azure/functions";
import { DequeuedMessageItem, QueueClient } from "@azure/storage-queue";
import { Response } from "node-fetch";

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
jest.mock("../config", () => ({
  ENV: {
    AZ_STORAGE_QUEUE_SVC_URL: "hello",
    AZ_STORAGE_ACCOUNT_NAME: "hola",
    AZ_STORAGE_ACCOUNT_KEY: "bonjour",
    TEST_EVENT_QUEUE_NAME: "ciao",
    FILE_ERROR_QUEUE_NAME: "cheese",
    REPORT_STREAM_URL: "https://nope.url/1234",
    REPORT_STREAM_TOKEN: "merhaba",
    REPORT_STREAM_BATCH_MINIMUM: "hallo",
    REPORT_STREAM_BATCH_MAXIMUM: "dzień dobry",
  },
}));

describe("main function export", () => {
  const context = {
    log: jest.fn(),
    traceContext: { traceparent: "asdf" },
  } as jest.MockedObject<Context>;
  context.log.error = jest.fn();

  let getQueueClientMock;
  let dequeueMessagesMock;
  let minimumMessagesAvailableMock;
  let uploadResultMock;
  let deleteMessagesMock;
  let reportExceptionsMock;
  let fileFailureMock;

  function prepareQueue(items: Array<{ messageText: string }>): void {
    minimumMessagesAvailableMock = jest
      .spyOn(queueHandlers, "minimumMessagesAvailable")
      .mockResolvedValue(items.length > 0);
    dequeueMessagesMock = jest
      .spyOn(queueHandlers, "dequeueMessages")
      .mockResolvedValue(items as DequeuedMessageItem[]);
    uploadResultMock = jest.spyOn(lib, "uploadResult").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ destinationCount: 4 }),
    } as jest.Mocked<Response>);
  }

  beforeAll(() => {
    getQueueClientMock = jest
      .spyOn(queueHandlers, "getQueueClient")
      .mockReturnValue({ name: "dummyQueue" } as QueueClient);
    deleteMessagesMock = jest.spyOn(
      queueHandlers,
      "deleteSuccessfullyParsedMessages",
    );
    reportExceptionsMock = jest.spyOn(queueHandlers, "reportExceptions");
    fileFailureMock = jest.spyOn(queueHandlers, "publishToQueue");
  });

  beforeEach(() => {
    jest.resetAllMocks();
    context.log.mockReset();
  });

  describe("minimum messages", () => {
    it("aborts if there are not enough messages", async () => {
      // GIVEN
      prepareQueue([]);

      // WHEN
      await fn(context);

      // THEN
      expect(getQueueClientMock).toHaveBeenCalledTimes(3);
      expect(minimumMessagesAvailableMock).toHaveBeenCalled();
      expect(dequeueMessagesMock).not.toHaveBeenCalled();
    });
  });

  it("calls all the right lib methods on success", async () => {
    // GIVEN
    prepareQueue([
      { messageText: JSON.stringify({ a: "b" }) },
      { messageText: JSON.stringify({ c: "d" }) },
    ]);

    // WHEN
    await fn(context);

    // THEN
    expect(getQueueClientMock).toHaveBeenCalledTimes(3);
    expect(minimumMessagesAvailableMock).toHaveBeenCalled();
    expect(dequeueMessagesMock).toHaveBeenCalled();
    expect(uploadResultMock).toHaveBeenCalled();
    expect(deleteMessagesMock).toHaveBeenCalled();
    expect(reportExceptionsMock).toHaveBeenCalled();
  });

  it("throws on upload failure", async () => {
    // GIVEN
    prepareQueue([
      { messageText: JSON.stringify({ a: "b" }) },
      { messageText: JSON.stringify({ c: "d" }) },
    ]);
    uploadResultMock = jest.spyOn(lib, "uploadResult").mockResolvedValue({
      ok: false,
      text: () => Promise.resolve("error"),
    } as jest.Mocked<Response>);

    // WHEN
    try {
      await fn(context);
      expect(0).toBe(1);
    } catch (e) {
      expect(e).toBeDefined();
    }

    // THEN
    expect(getQueueClientMock).toHaveBeenCalledTimes(3);
    expect(minimumMessagesAvailableMock).toHaveBeenCalled();
    expect(dequeueMessagesMock).toHaveBeenCalled();
    expect(uploadResultMock).toHaveBeenCalled();
  });

  it("logs telemetry for parse failures", async () => {
    // GIVEN
    prepareQueue([
      { messageText: JSON.stringify({ a: "b" }) },
      { messageText: "this is not json at all" },
    ]);

    // WHEN
    await fn(context);

    // THEN
    expect(getQueueClientMock).toHaveBeenCalledTimes(3);
    expect(appInsights.defaultClient.trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Queue: ciao. Test Event Parse Failure",
      }),
    );
    expect(deleteMessagesMock).toHaveBeenCalled();
  });

  it("aborts if no successfully parsed messages", async () => {
    // GIVEN
    prepareQueue([{ messageText: "this is not json at all" }]);

    // WHEN
    await fn(context);

    // THEN
    expect(dequeueMessagesMock).toHaveBeenCalled();
    expect(appInsights.defaultClient.trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Queue: ciao. Test Event Parse Failure",
      }),
    );
    expect(uploadResultMock).not.toHaveBeenCalled();
    expect(reportExceptionsMock).not.toHaveBeenCalled();
    expect(deleteMessagesMock).not.toHaveBeenCalled();
  });

  it("messages to failure queue response is 400", async () => {
    // GIVEN
    prepareQueue([
      { messageText: JSON.stringify({ a: "b" }) },
      { messageText: JSON.stringify({ c: "d" }) },
    ]);

    uploadResultMock = jest.spyOn(lib, "uploadResult").mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ destinationCount: 4 }),
      text: () => Promise.resolve("error"),
    } as jest.Mocked<Response>);

    // WHEN
    try {
      await fn(context);
    } catch (e) {
      expect(e).toBeDefined();
    }

    //THEN
    expect(dequeueMessagesMock).toHaveBeenCalled();
    expect(uploadResultMock).toHaveBeenCalled();
    expect(reportExceptionsMock).not.toHaveBeenCalled();
    expect(fileFailureMock).toHaveBeenCalled();
    expect(deleteMessagesMock).toHaveBeenCalled();
  });
});
