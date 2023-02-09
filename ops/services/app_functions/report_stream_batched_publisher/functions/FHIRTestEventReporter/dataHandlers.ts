import { DequeuedMessageItem } from "@azure/storage-queue";

export type FHIRTestEventsBatch = {
  messages: DequeuedMessageItem[];
  testEventsNDJSON: string;
  parseFailure: Record<string, boolean>;
  parseFailureCount: number;
  parseSuccessCount: number;
};

function createNewBatch(): FHIRTestEventsBatch {
  return {
    messages: [],
    testEventsNDJSON: "",
    parseFailure: {},
    parseFailureCount: 0,
    parseSuccessCount: 0,
  };
}

export function processTestEvents(
  messages: DequeuedMessageItem[],
  bundleSizeLimit: number
): FHIRTestEventsBatch[] {
  const bundles: FHIRTestEventsBatch[] = [];
  const delimiterSize = Buffer.byteLength("\n");

  if (messages.length <= 0) {
    return bundles;
  }

  let currentBundle = createNewBatch();
  let bundleSize = 0;

  messages.forEach((message: DequeuedMessageItem) => {
    const messageSize: number = Buffer.byteLength(message.messageText);

    // check if message can be added to current bundle
    // or should be added to a new one
    if (bundleSize + messageSize + delimiterSize > bundleSizeLimit) {
      // remove enter from last ndjson
      const cleanedNDJSON = currentBundle.testEventsNDJSON.slice(0, -1);
      currentBundle.testEventsNDJSON = cleanedNDJSON;

      // push full bundle and create new bundle
      bundles.push(currentBundle);
      currentBundle = createNewBatch();
      bundleSize = 0;
    }

    currentBundle.messages.push({ ...message });
    bundleSize += messageSize;

    try {
      JSON.parse(message.messageText);
      currentBundle.parseSuccessCount++;
      currentBundle.testEventsNDJSON += `${message.messageText}\n`;
    } catch (e) {
      currentBundle.parseFailure[message.messageId] = true;
      currentBundle.parseFailureCount++;
    }
  });

  const cleanedNDJSON = currentBundle.testEventsNDJSON.slice(0, -1);
  currentBundle.testEventsNDJSON = cleanedNDJSON;
  bundles.push(currentBundle);

  return bundles;
}
