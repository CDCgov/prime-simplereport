import fn from "./index";
import * as lib from "./lib";
import * as appInsights from "applicationinsights";
import * as config from "./config";
import { Context } from "@azure/functions";
import { DequeuedMessageItem } from "@azure/storage-queue";

jest.mock("applicationinsights", jest.fn().mockImplementation(() => ({
  setup: jest.fn(),
  defaultClient: {
    trackEvent: jest.fn(),
    trackDependency: jest.fn(),
  },
})));
jest.mock("./config", () => ({
  ENV: {
    AZ_STORAGE_QUEUE_SVC_URL: "hello",
    AZ_STORAGE_ACCOUNT_NAME: "hola",
    AZ_STORAGE_ACCOUNT_KEY: "bonjour",
    TEST_EVENT_QUEUE_NAME: "ciao",
    REPORT_STREAM_URL: "https://nope.url/1234",
    REPORT_STREAM_TOKEN: "merhaba",
    REPORT_STREAM_BATCH_MINIMUM: "hallo",
    REPORT_STREAM_BATCH_MAXIMUM: "dzień dobry",
  },
}));

import { enableFetchMocks, FetchMock } from "jest-fetch-mock";
enableFetchMocks();

// jest.mock("./lib", () => ({
//   getQueueClient: jest.fn(),
//   minimumMessagesAvailable: jest.fn(() => {
//     console.info("hello");
//   }),
//   dequeueMessages: jest.fn(),
//   convertToCsv: jest.fn(),
//   deleteSuccessfullyParsedMessages: jest.fn(),
// }));

describe("main function export", () => {
  const context: Context = {
    log: jest.fn(),
    traceContext: { traceparent: "asdf" },
  } as any;
  context.log.error = jest.fn();

  let dequeueMessagesMock;
  let minimumMessagesAvailableMock;
  let uploadResultMock;
  let deleteMessagesMock;

  function prepareQueue(items: Array<{ messageText: string }>): void {
    minimumMessagesAvailableMock = jest
      .spyOn(lib, "minimumMessagesAvailable")
      .mockResolvedValue(items.length > 0);
    dequeueMessagesMock = jest
      .spyOn(lib, "dequeueMessages")
      .mockResolvedValue(items as DequeuedMessageItem[]);
    uploadResultMock = jest
      .spyOn(lib, "uploadResult")
      .mockResolvedValue({ ok: true, json: () => Promise.resolve({ destinationCount: 4 }) } as any);
    deleteMessagesMock = jest.spyOn(lib, 'deleteSuccessfullyParsedMessages');
  }

  beforeEach(() => {
    (context.log as any as jest.Mock).mockReset();
    (fetch as FetchMock).resetMocks();
  });

  describe("minimum messages", () => {
    it("aborts if there are not enough messages", async () => {
      // GIVEN
      prepareQueue([]);

      // WHEN
      await fn(context);

      // THEN
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
    expect(minimumMessagesAvailableMock).toHaveBeenCalled();
    expect(dequeueMessagesMock).toHaveBeenCalled();
    expect(uploadResultMock).toHaveBeenCalled();
    expect(deleteMessagesMock).toHaveBeenCalled();
  });

  it("throws on upload failure", async () => {
    // GIVEN
    prepareQueue([
      { messageText: JSON.stringify({ a: "b" }) },
      { messageText: JSON.stringify({ c: "d" }) },
    ]);
    uploadResultMock = jest.spyOn(lib, 'uploadResult').mockResolvedValue({ ok: false, text: () => Promise.resolve('error') } as any);

    // WHEN
    try { 
      await fn(context);
      expect(0).toBe(1);
    } catch(e) {
      expect(e).toBeDefined();
    }

    // THEN
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
    expect(appInsights.defaultClient.trackEvent).toHaveBeenCalled();
    expect(deleteMessagesMock).toHaveBeenCalled();
  });
});
