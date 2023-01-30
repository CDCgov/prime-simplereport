import { DequeuedMessageItem } from "@azure/storage-queue";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SimpleReportTestEvent = Record<any, any>;

export type ProcessedTestEvents = {
  testEvents: SimpleReportTestEvent[];
  parseFailure: Record<string, boolean>;
  parseFailureCount: number;
  parseSuccessCount: number;
};

export function processTestEvents(
  messages: DequeuedMessageItem[]
): ProcessedTestEvents {
  const parseFailure: { [k: string]: boolean } = {};
  let parseFailureCount = 0;
  const testEventsAsJSON = messages.flatMap((m: DequeuedMessageItem) => {
    try {
      return [JSON.parse(m.messageText)];
    } catch (e) {
      parseFailure[m.messageId] = true;
      parseFailureCount++;
      return [];
    }
  });

  return {
    testEvents: testEventsAsJSON,
    parseFailure,
    parseFailureCount,
    parseSuccessCount: testEventsAsJSON.length,
  };
}
