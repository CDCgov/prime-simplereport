import { Context } from "@azure/functions";
import { DequeuedMessageItem, QueueClient } from "@azure/storage-queue";
import fetch, { Headers, Response } from "node-fetch";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { TelemetryClient } from "applicationinsights";

import { ENV, uploaderVersion } from "../config";
import { ReportStreamResponse, ReportStreamTokenResponse } from "./types";
import {
  deleteSuccessfullyParsedMessages,
  publishToQueue,
  reportExceptions,
} from "./queueHandlers";

const {
  FHIR_REPORT_STREAM_TOKEN,
  FHIR_REPORT_STREAM_KEY,
  REPORT_STREAM_URL,
  REPORT_STREAM_BASE_URL,
} = ENV;

export const FHIR_CLIENT_ID = "simple_report.fullelr";

export async function reportToUniversalPipelineTokenBased(
  token: string,
  ndjsonTestEvents: string
): Promise<Response> {
  const headers = new Headers({
    authorization: `bearer ${token}`,
    "x-api-version": uploaderVersion,
    "content-type": "application/fhir+ndjson",
    client: "simple_report",
  });

  return fetch(`${REPORT_STREAM_BASE_URL}/api/waters`, {
    method: "POST",
    headers,
    body: ndjsonTestEvents,
  });
}

export async function reportToUniversalPipelineSharedKey(
  ndjsonTestEvents: string
): Promise<Response> {
  const headers = new Headers({
    "x-functions-key": FHIR_REPORT_STREAM_TOKEN,
    "x-api-version": uploaderVersion,
    "content-type": "application/fhir+ndjson",
    client: FHIR_CLIENT_ID,
  });

  return fetch(REPORT_STREAM_URL, {
    method: "POST",
    headers,
    body: ndjsonTestEvents,
  });
}

export async function handleReportStreamResponse(
  reportingResponse: Response,
  context: Context,
  messages: DequeuedMessageItem[],
  parseFailure: Record<string, boolean>,
  testEventQueue: QueueClient,
  exceptionQueue: QueueClient,
  errorQueue: QueueClient,
  telemetry: TelemetryClient
) {
  if (reportingResponse.ok) {
    const response: ReportStreamResponse =
      (await reportingResponse.json()) as ReportStreamResponse;
    context.log(
      `Queue: ${testEventQueue.name}. Report Stream response: ${JSON.stringify(
        response
      )}`
    );
    await reportExceptions(
      context,
      exceptionQueue,
      response,
      testEventQueue.name
    );

    context.log(
      `Queue: ${testEventQueue.name}. Upload to ${response.destinationCount} reporting destinations successful; deleting messages`
    );

    await deleteSuccessfullyParsedMessages(
      context,
      testEventQueue,
      messages,
      parseFailure
    );
  } else {
    const responseBody = await reportingResponse.text();
    const errorText = `Queue: ${testEventQueue.name}. Failed to upload to ReportStream with response code ${reportingResponse.status}`;
    context.log.error(
      `${errorText}. Response body (${responseBody.length} bytes): `,
      responseBody
    );

    const tagOverrides = {
      "ai.operation.id": context.traceContext.traceparent,
    };
    telemetry.trackEvent({
      name: `Queue: ${testEventQueue.name}. ReportStream Upload Failed`,
      properties: {
        status: reportingResponse.status,
        responseBody,
      },
      tagOverrides,
    });

    if (reportingResponse.status === 400) {
      //publish messages to file failure queue
      await publishToQueue(errorQueue, messages);
      //delete messages from the main queue
      await deleteSuccessfullyParsedMessages(
        context,
        testEventQueue,
        messages,
        parseFailure
      );
    }

    throw new Error(errorText);
  }
}

export function generateJWT(
  reportStreamClient: string,
  reportStreamUrl: string,
  secret: string
): string {
  const token = jwt.sign(
    {
      iss: reportStreamClient,
      sub: reportStreamClient,
      jti: crypto.randomUUID(),
    },
    secret,
    {
      algorithm: "RS256",
      expiresIn: "5m",
      header: {
        kid: reportStreamClient,
        typ: "JWT",
        alg: "RS256",
      },
      audience: reportStreamUrl,
    }
  );

  return token;
}

export async function getReportStreamAuthToken(
  context: Context
): Promise<string> {
  const tokenURL = `${REPORT_STREAM_BASE_URL}/api/token`;
  const jwt = generateJWT(
    FHIR_CLIENT_ID,
    REPORT_STREAM_BASE_URL,
    FHIR_REPORT_STREAM_KEY
  );

  const headers = new Headers({
    "Content-Type": "application/x-www-form-urlencoded",
  });

  const params = {
    scope: `simple_report.*.report`,
    grant_type: "client_credentials",
    client_assertion_type:
      "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
    client_assertion: jwt,
  };

  try {
    const response = await fetch(tokenURL, {
      method: "POST",
      headers,
      body: Object.entries(params)
        .map((entry) => `${entry[0]}=${entry[1]}`)
        .join("&"),
    });

    if (!response.ok) {
      const responseError = await response.text();
      throw new Error(`ReportStream Error Response: ${responseError}`);
    }

    const tokenResponse: ReportStreamTokenResponse =
      (await response.json()) as ReportStreamTokenResponse;

    const tokenLog = { ...tokenResponse };
    tokenLog.access_token = "***";
    context.log(`Token obtained successfully: ${JSON.stringify(tokenLog)}`);

    return tokenResponse.access_token;
  } catch (e) {
    context.log.error(
      "Error while trying to get the ReportStream auth token.",
      e
    );

    throw e;
  }
}
