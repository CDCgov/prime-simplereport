import { processTestEvents, serializeTestEventsAsNdjson } from "./dataHandlers";
import { DequeuedMessageItem } from "@azure/storage-queue";

describe("data handlers", () => {
  describe("processTestEvents", () => {
    it("process data with no failures", () => {
      const validMessages: DequeuedMessageItem[] = [
        {
          messageId: "1",
          messageText: JSON.stringify({ patientName: "Dexter" }),
        } as jest.MockedObject<DequeuedMessageItem>,
      ];
      const processedEvents = processTestEvents(validMessages);
      expect(processedEvents).toHaveProperty("testEvents");
      expect(processedEvents.testEvents).toHaveLength(1);
      expect(processedEvents).toHaveProperty("parseFailure", {});
      expect(processedEvents).toHaveProperty("parseFailureCount", 0);
      expect(processedEvents).toHaveProperty("parseSuccessCount", 1);
    });

    it("process data and records the failures", () => {
      const invalidMessages: DequeuedMessageItem[] = [
        {
          messageId: "1",
          messageText: "not_a_json",
        } as jest.MockedObject<DequeuedMessageItem>,
      ];
      const processedEvents = processTestEvents(invalidMessages);
      expect(processedEvents).toHaveProperty("testEvents");
      expect(processedEvents.testEvents).toHaveLength(0);
      expect(processedEvents).toHaveProperty("parseFailure", { "1": true });
      expect(processedEvents).toHaveProperty("parseFailureCount", 1);
      expect(processedEvents).toHaveProperty("parseSuccessCount", 0);
    });
  });

  describe('serializeTestEventsAsNdjson',()=>{
    it('returns empty string for empty array',()=>{
      expect(serializeTestEventsAsNdjson([])).toStrictEqual("");
    });
    it('transform array with one event and returns string with no [enter] at the end',()=>{
      expect(serializeTestEventsAsNdjson([{"foo":"bar"}])).toStrictEqual("{\"foo\":\"bar\"}");
    });
    it('transform array with multiple events and returns string with no [enter] at the end',()=>{
      expect(serializeTestEventsAsNdjson([{"foo":"bar"},{"foo":"123"}])).toStrictEqual("{\"foo\":\"bar\"}\n{\"foo\":\"123\"}");
    });
  });
});
