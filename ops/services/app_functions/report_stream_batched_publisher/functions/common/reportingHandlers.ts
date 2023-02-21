import { Context } from "@azure/functions";
import { DequeuedMessageItem, QueueClient } from "@azure/storage-queue";
import fetch, { Headers, Response } from "node-fetch";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import { ENV, uploaderVersion } from "../config";
import { ReportStreamResponse } from "./types";
import {
  deleteSuccessfullyParsedMessages,
  publishToQueue,
  reportExceptions,
} from "./queueHandlers";
import * as appInsights from "applicationinsights";

const {
  FHIR_REPORT_STREAM_TOKEN,
  FHIR_REPORT_STREAM_KEY,
  REPORT_STREAM_URL,
  REPORT_STREAM_BASE_URL,
} = ENV;

const telemetry = appInsights.defaultClient;

export const FHIR_CLIENT_ID = "simple_report.fullelr";

export async function reportToUniversalPipelineTokenBased(
  token: string,
  ndjsonTestEvents: string
): Promise<Response> {
  const headers = new Headers({
    authorization: `Bearer ${token}`,
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
  errorQueue: QueueClient
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
      audience: reportStreamUrl, // ToDo check if this is the url where we are pushing stuff to or what are the values for PROD and STG
    }
  );

  return token;
}

export async function getReportStreamAuthToken(
  context: Context
): Promise<string> {
  const tokenURL = `${REPORT_STREAM_BASE_URL}/api/token`;
  // ToDo hookup real value for aud field (check the JAVA PR first)
  // the report stream url has to be set same way as the report_stream_url variable in locals
  const jwt = generateJWT(FHIR_CLIENT_ID, "url", FHIR_REPORT_STREAM_KEY);

  const headers = new Headers({
    "Content-Type": "application/x-www-form-urlencoded",
  });

  const params = {
    scope: `${FHIR_CLIENT_ID}.default.report`,
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

    return response["access_token"];
  } catch (e) {
    context.log.error(
      "Error while trying to get the ReportStream auth token.",
      e
    );

    throw e;
  }
}
