import { DequeuedMessageItem } from "@azure/storage-queue";
import csvStringify from "csv-stringify/lib/sync";
import { ENV, uploaderVersion } from "../config";
import fetch, { Headers } from "node-fetch";

const { REPORT_STREAM_TOKEN, REPORT_STREAM_URL } = ENV;

export function convertToCsv(messages: DequeuedMessageItem[]) {
  const parseFailure: { [k: string]: boolean } = {};
  let parseFailureCount = 0;
  const messageTexts = messages
    .map((m) => {
      try {
        return JSON.parse(m.messageText);
      } catch (e) {
        parseFailure[m.messageId] = true;
        parseFailureCount++;
        return undefined;
      }
    })
    .filter((m) => m !== undefined);
  return {
    csvPayload: csvStringify(messageTexts, { header: true }),
    parseFailure,
    parseFailureCount,
    parseSuccessCount: messageTexts.length,
  };
}

export async function uploadResult(body) {
  const headers = new Headers({
    "x-functions-key": REPORT_STREAM_TOKEN,
    "x-api-version": uploaderVersion,
    "content-type": "text/csv",
    client: "simple_report",
  });
  return fetch(REPORT_STREAM_URL, {
    method: "POST",
    headers,
    body,
  });
}
