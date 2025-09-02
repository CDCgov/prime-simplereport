import { ENV } from "../config";

export type Environment = "Test" | "Prod";

export function formatTimestamp(date: Date): string {
  const y = date.getUTCFullYear().toString();
  const m = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const d = date.getUTCDate().toString().padStart(2, "0");
  const hh = date.getUTCHours().toString().padStart(2, "0");
  const mm = date.getUTCMinutes().toString().padStart(2, "0");
  const ss = date.getUTCSeconds().toString().padStart(2, "0");
  const ms = date.getUTCMilliseconds().toString().padStart(3, "0");
  return `${y}${m}${d}${hh}${mm}${ss}${ms}`;
}

export function formatInterPartnerFilename(
  env: Environment,
  timestamp: Date,
  sof: string,
): string {
  return [
    "InterPartner",
    "DatapultELRPivot",
    "Simple-Report",
    "AIMSPlatform",
    env, // sending env
    env, // receiving env
    formatTimestamp(timestamp),
    "STOP",
    sof,
  ].join("~");
}

export function parseHL7Message(messageText: string) {
  if (!messageText) throw new Error("Invalid message: empty message text");

  const msh = messageText.match(/^MSH\|(?:[^|]*\|){8}([^|]*)\|/m);
  if (!msh || !msh[1] || !msh[1].trim()) {
    throw new Error(
      "Invalid message: unable to parse message ID from HL7 MSH segment",
    );
  }

  const messageId = msh[1].trim();
  const rawEnv = ENV.AIMS_ENVIRONMENT;
  if (rawEnv !== "Test" && rawEnv !== "Prod") {
    throw new Error(
      `Invalid AIMS_ENVIRONMENT: ${rawEnv}. Expected 'Test' or 'Prod'.`,
    );
  }

  const filename = formatInterPartnerFilename(
    rawEnv,
    new Date(),
    `${messageId}.hl7`,
  );
  return { content: messageText, messageId, filename };
}
