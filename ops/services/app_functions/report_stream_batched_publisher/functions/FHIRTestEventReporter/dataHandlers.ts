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
  fhirBatchSizeLimit: number
): FHIRTestEventsBatch[] {
  const fhirTestEventsBatches: FHIRTestEventsBatch[] = [];
  const delimiterSize = Buffer.byteLength("\n");

  if (messages.length <= 0) {
    return fhirTestEventsBatches;
  }

  let currentBatch = createNewBatch();
  let batchSize = 0;

  messages.forEach((message: DequeuedMessageItem) => {
    const messageSize: number = Buffer.byteLength(message.messageText);

    // check if message can be added to current batch
    // or should be added to a new one
    if (batchSize + messageSize + delimiterSize > fhirBatchSizeLimit) {
      // remove enter character from last fhir test event
      const cleanedNDJSON = currentBatch.testEventsNDJSON.slice(0, -1);
      currentBatch.testEventsNDJSON = cleanedNDJSON;

      // push full batch and create new batch
      fhirTestEventsBatches.push(currentBatch);
      currentBatch = createNewBatch();
      batchSize = 0;
    }

    currentBatch.messages.push({ ...message });
    batchSize += messageSize;

    try {
      JSON.parse(message.messageText);
      currentBatch.parseSuccessCount++;
      currentBatch.testEventsNDJSON += `${message.messageText}\n`;
    } catch (e) {
      currentBatch.parseFailure[message.messageId] = true;
      currentBatch.parseFailureCount++;
    }
  });

  const cleanedNDJSON = currentBatch.testEventsNDJSON.slice(0, -1);
  currentBatch.testEventsNDJSON = cleanedNDJSON;
  fhirTestEventsBatches.push(currentBatch);

  return fhirTestEventsBatches;
}
