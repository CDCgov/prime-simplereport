import { Context } from "@azure/functions";
import { DequeuedMessageItem } from "@azure/storage-queue";
import { uploadResult, convertToCsv } from "./lib";

import fetch from "node-fetch";
import fetchMock from "jest-fetch-mock";
jest.mock(
  "node-fetch",
  jest.fn(() => require("jest-fetch-mock")),
);

jest.mock("../config", () => ({
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

jest.mock("@azure/storage-queue");

const context = {
  log: jest.fn(),
  traceContext: { traceparent: "asdf" },
} as jest.MockedObject<Context>;
context.log.error = jest.fn();

describe("lib", () => {
  describe("CSV conversion", () => {
    it("converts to csv and records parsing errors", () => {
      // GIVEN
      const messages = [
        {
          messageId: "1111",
          popReceipt: "aa",
          messageText: '{"Result_ID" : 1}',
        },
        {
          messageId: "2222",
          popReceipt: "bb",
          messageText: '{"Result_ID" : 2}',
        },
        {
          messageId: "3333",
          popReceipt: "cc",
          messageText: '{"Result_ID" : 3}',
        },
        {
          messageId: "4444",
          popReceipt: "dd",
          messageText: "{ERROR : 4}",
        },
      ] as jest.Mocked<DequeuedMessageItem>[];

      // WHEN
      const { csvPayload, parseFailure, parseFailureCount, parseSuccessCount } =
        convertToCsv(messages);

      // THEN
      expect(parseSuccessCount).toBe(3);
      expect(csvPayload).toBe("Result_ID\n1\n2\n3\n");

      expect(parseFailureCount).toBe(1);
      expect(parseFailure).toStrictEqual({ 4444: true });
    });
  });

  describe("uploadResult", () => {
    it("calls fetch", async () => {
      // GIVEN
      fetchMock.mockResponseOnce("yup");

      // WHEN
      await uploadResult("whatever");

      // THEN
      expect(fetch).toHaveBeenCalled();
    });
  });
});
