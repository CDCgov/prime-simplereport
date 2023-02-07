import { Context } from "@azure/functions";
import fetchMock from "jest-fetch-mock";
import {
  DequeuedMessageItem,
  QueueClient,
  QueueDeleteMessageResponse,
} from "@azure/storage-queue";
import { Response } from "node-fetch";

import * as queueHandlers from "./queueHandlers";
import {
  handleReportStreamResponse,
  reportToUniversalPipeline,
} from "./reportingHandlers";
import { serializeTestEventsAsNdjson } from "../FHIRTestEventReporter/dataHandlers";
 import { uploaderVersion } from "../config";
import { ReportStreamResponse } from "./types";

jest.mock(
  "node-fetch",
  jest.fn(() => fetchMock)
);

jest.mock("../config", () => ({
  ENV: {
    REPORT_STREAM_URL: "https://nope.url/1234",
    FHIR_REPORT_STREAM_TOKEN: "merhaba",
  },
}));

jest.mock(
  "applicationinsights",
  jest.fn().mockImplementation(() => ({
    defaultClient: {
      trackEvent: jest.fn(),
    },
  }))
);

describe("reportingHandlers", () => {
  describe("reportToUniversalPipeline", () => {
    it("calls fetch with correct parameters", async () => {
      const mockHeaders = new Headers({
        "x-functions-key": "merhaba",
        "x-api-version": uploaderVersion,
        "content-type": "application/fhir+ndjson",
        client: "simple_report.fullelr",
      });

      const serializedTestEvents: string = serializeTestEventsAsNdjson([]);
      await reportToUniversalPipeline("");
      expect(fetchMock).toHaveBeenCalledWith("https://nope.url/1234", {
        method: "POST",
        headers: mockHeaders,
        body:serializedTestEvents,
      });
    });
  });

  describe("handleReportStreamResponse", () => {
    const context = {
      log: jest.fn(),
      traceContext: { traceparent: "asdf" },
    } as jest.MockedObject<Context>;
    context.log.error = jest.fn();
    const messagesMock = [] as DequeuedMessageItem[];
    const parseFailureMock = {};

    const eventQueueMock = {
      name: "dummyTestEventQueue",
      deleteMessage: jest.fn().mockResolvedValue({
        requestId: "123",
      } as QueueDeleteMessageResponse),
    } as jest.MockedObject<QueueClient>;

    const errorQueueMock = {
      name: "dummyErrorEventQueue",
      deleteMessage: jest.fn().mockResolvedValue({
        requestId: "123",
      } as QueueDeleteMessageResponse),
    } as jest.MockedObject<QueueClient>;

    const exceptionQueueMock = {
      name: "dummyExceptionEventQueue",
      deleteMessage: jest.fn().mockResolvedValue({
        requestId: "123",
      } as QueueDeleteMessageResponse),
    } as jest.MockedObject<QueueClient>;

    let reportExceptionsSpy,
      deleteSuccessfullyParsedMessagesSpy,
      publishToQueueSpy;

    beforeEach(() => {
      reportExceptionsSpy = jest.spyOn(queueHandlers, "reportExceptions");
      deleteSuccessfullyParsedMessagesSpy = jest.spyOn(
        queueHandlers,
        "deleteSuccessfullyParsedMessages"
      );
      publishToQueueSpy = jest.spyOn(queueHandlers, "publishToQueue");
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it("handles a successful response", async () => {
      const responseMock = {
        ok: true,
        status: 200,
        text: jest.fn().mockResolvedValue(""),
        json: jest.fn().mockResolvedValue({
          warnings: [],
          errors: [],
        } as jest.MockedObject<ReportStreamResponse>),
      } as jest.MockedObject<Response>;

      await handleReportStreamResponse(
        responseMock as Response,
        context,
        messagesMock,
        parseFailureMock,
        eventQueueMock,
        exceptionQueueMock,
        errorQueueMock
      );

      expect(responseMock.json).toHaveBeenCalled();
      expect(context.log).toHaveBeenCalled();
      expect(reportExceptionsSpy).toHaveBeenCalled();
      expect(deleteSuccessfullyParsedMessagesSpy).toHaveBeenCalledWith(
        context,
        eventQueueMock,
        messagesMock,
        parseFailureMock
      );
      expect(responseMock.text).not.toHaveBeenCalled();
    });

    it("handles a failed response", async () => {
      const responseMock = {
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValue(""),
        json: jest.fn().mockResolvedValue({
          warnings: [],
          errors: [],
        } as jest.MockedObject<ReportStreamResponse>),
      } as jest.MockedObject<Response>;

      await expect(
        handleReportStreamResponse(
          responseMock as Response,
          context,
          messagesMock,
          parseFailureMock,
          eventQueueMock,
          exceptionQueueMock,
          errorQueueMock
        )
      ).rejects.toThrow();

      expect(responseMock.json).not.toHaveBeenCalled();
      expect(context.log.error).toHaveBeenCalled();
      expect(publishToQueueSpy).not.toHaveBeenCalled();
      expect(deleteSuccessfullyParsedMessagesSpy).not.toHaveBeenCalled();
      expect(responseMock.text).toHaveBeenCalled();
    });

    it("handles a failed response with status code 400", async () => {
      const responseMock = {
        ok: false,
        status: 400,
        text: jest.fn().mockResolvedValue(""),
        json: jest.fn().mockResolvedValue({
          warnings: [],
          errors: [],
        } as jest.MockedObject<ReportStreamResponse>),
      } as jest.MockedObject<Response>;

      await expect(
        handleReportStreamResponse(
          responseMock as Response,
          context,
          messagesMock,
          parseFailureMock,
          eventQueueMock,
          exceptionQueueMock,
          errorQueueMock
        )
      ).rejects.toThrow();

      expect(responseMock.json).not.toHaveBeenCalled();
      expect(context.log.error).toHaveBeenCalled();
      expect(publishToQueueSpy).toHaveBeenCalled();
      expect(deleteSuccessfullyParsedMessagesSpy).toHaveBeenCalledWith(
        context,
        eventQueueMock,
        messagesMock,
        parseFailureMock
      );
      expect(responseMock.text).toHaveBeenCalled();
    });
  });
});
