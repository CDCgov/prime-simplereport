import { Context } from "@azure/functions";
import fetchMock from "jest-fetch-mock";
import {
  DequeuedMessageItem,
  QueueClient,
  QueueDeleteMessageResponse,
} from "@azure/storage-queue";
import { Headers, Response } from "node-fetch";
import jwt from "jsonwebtoken";
import { generateKeyPair } from "crypto";
import { promisify } from "util";
import { TelemetryClient } from "applicationinsights";

import * as queueHandlers from "./queueHandlers";
import { uploaderVersion } from "../config";
import { ReportStreamResponse, ReportStreamTokenResponse } from "./types";
import {
  handleReportStreamResponse,
  generateJWT,
  getReportStreamAuthToken,
  reportToUniversalPipelineTokenBased,
  FHIR_CLIENT_ID,
} from "./reportingHandlers";

jest.mock(
  "node-fetch",
  jest.fn(() => fetchMock),
);

jest.mock("../config", () => ({
  ENV: {
    REPORT_STREAM_BASE_URL: "https://nope.url",
  },
}));

jest.mock(
  "applicationinsights",
  jest.fn().mockImplementation(() => ({
    defaultClient: {
      trackEvent: jest.fn(),
    },
  })),
);

describe("reportingHandlers", () => {
  const context = {
    log: jest.fn(),
    traceContext: { traceparent: "asdf" },
  } as jest.MockedObject<Context>;
  context.log.error = jest.fn();

  const telemetry = {
    trackEvent: jest.fn(),
  } as jest.MockedObject<TelemetryClient>;

  describe("reportToUniversalPipelineTokenBased", () => {
    it("calls fetch with correct parameters", async () => {
      const mockHeaders = new Headers({
        authorization: "bearer 123abc",
        "x-api-version": uploaderVersion,
        "content-type": "application/fhir+ndjson",
        client: FHIR_CLIENT_ID,
      });

      const serializedTestEvents = '{"name":"DeeDee"}';
      await reportToUniversalPipelineTokenBased("123abc", serializedTestEvents);
      expect(fetchMock).toHaveBeenCalledWith("https://nope.url/api/waters", {
        method: "POST",
        headers: mockHeaders,
        body: serializedTestEvents,
      });
    });
  });

  describe("handleReportStreamResponse", () => {
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
        "deleteSuccessfullyParsedMessages",
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

        messagesMock,
        parseFailureMock,
        eventQueueMock,
        exceptionQueueMock,
        errorQueueMock,
        { telemetry, context },
      );

      expect(responseMock.json).toHaveBeenCalled();
      expect(context.log).toHaveBeenCalled();
      expect(reportExceptionsSpy).toHaveBeenCalled();
      expect(deleteSuccessfullyParsedMessagesSpy).toHaveBeenCalledWith(
        context,
        eventQueueMock,
        messagesMock,
        parseFailureMock,
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
          messagesMock,
          parseFailureMock,
          eventQueueMock,
          exceptionQueueMock,
          errorQueueMock,
          { telemetry, context },
        ),
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
          messagesMock,
          parseFailureMock,
          eventQueueMock,
          exceptionQueueMock,
          errorQueueMock,
          { telemetry, context },
        ),
      ).rejects.toThrow();

      expect(responseMock.json).not.toHaveBeenCalled();
      expect(context.log.error).toHaveBeenCalled();
      expect(publishToQueueSpy).toHaveBeenCalled();
      expect(deleteSuccessfullyParsedMessagesSpy).toHaveBeenCalledWith(
        context,
        eventQueueMock,
        messagesMock,
        parseFailureMock,
      );
      expect(responseMock.text).toHaveBeenCalled();
    });
  });

  describe("generateJWT", () => {
    const clientId = "FHIR.client";
    const reportStreamUrl = "reportStream.gov";

    jest.setTimeout(30000);
    it("generates token according to ReportStream guidelines", async () => {
      const generateKeyPairAsync = promisify(generateKeyPair);

      const keyPair = await generateKeyPairAsync("rsa", {
        modulusLength: 4096,
      });

      const privateKey = keyPair.privateKey.export({
        format: "pem",
        type: "pkcs1",
      }) as string;

      const token = generateJWT(clientId, reportStreamUrl, privateKey);
      const decoded = jwt.verify(token, privateKey, {
        algorithm: "RS256",
        complete: true,
      });

      expect(decoded.header).toHaveProperty("kid", clientId);
      expect(decoded.header).toHaveProperty("typ", "JWT");
      expect(decoded.header).toHaveProperty("alg", "RS256");
      expect(decoded.payload).toHaveProperty("iss", clientId);
      expect(decoded.payload).toHaveProperty("sub", clientId);
      expect(decoded.payload).toHaveProperty("aud", reportStreamUrl);
      expect(decoded.payload).toHaveProperty("exp");
      expect(decoded.payload).toHaveProperty("jti");
    });
  });

  describe("getReportStreamAuthToken", () => {
    let jwtSignSpy;

    beforeEach(() => {
      jwtSignSpy = jest.spyOn(jwt, "sign");
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("obtains auth token successfully", async () => {
      const reportStreamTokenResponse: ReportStreamTokenResponse = {
        access_token: "123",
        token_type: "bearer",
        expires_in: 300,
        expires_at_seconds: 1625260982,
        scope: "FHIR.client.default.report",
        sub: "FHIR.client",
      };

      fetchMock.mockOnce(JSON.stringify(reportStreamTokenResponse));

      jwtSignSpy.mockReturnValueOnce("123abc");

      const token = await getReportStreamAuthToken(context);

      const headers = new Headers({
        "Content-Type": "application/x-www-form-urlencoded",
      });

      expect(fetchMock).toHaveBeenCalledWith("https://nope.url/api/token", {
        method: "POST",
        headers,
        body: "scope=simple_report.*.report&grant_type=client_credentials&client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer&client_assertion=123abc",
      });
      expect(token).toEqual("123");
    });

    it("fails to obtain auth token", async () => {
      jwtSignSpy.mockReturnValueOnce("123abc");
      fetchMock.mockOnce("error", { status: 400 });

      await expect(async () =>
        getReportStreamAuthToken(context),
      ).rejects.toThrow();

      expect(context.log.error).toHaveBeenCalledWith(
        "Error while trying to get the ReportStream auth token.",
        new Error(`ReportStream Error Response: error`),
      );
    });
  });
});
