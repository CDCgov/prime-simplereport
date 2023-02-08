import { processTestEvents } from "./dataHandlers";
import { DequeuedMessageItem } from "@azure/storage-queue";

describe("data handlers", () => {
  describe("processTestEvents", () => {

    const validMessages: DequeuedMessageItem[] = [
      {
        messageId: "1",
        messageText: JSON.stringify({ patientName: "Dexter" }),
      } as jest.MockedObject<DequeuedMessageItem>,
      {
        messageId: "2",
        messageText: JSON.stringify({ patientName: "Dee Dee" }),
      } as jest.MockedObject<DequeuedMessageItem>,
      {
        messageId: "3",
        messageText: JSON.stringify({ patientName: "Mandark" }),
      } as jest.MockedObject<DequeuedMessageItem>,
    ];

    it("process data with no failures and all fits in one bundle", () => {
      const processedEvents = processTestEvents(validMessages, 100);
      expect(processedEvents).toHaveLength(1);
      expect(processedEvents[0]).toHaveProperty("messages");
      expect(processedEvents[0].messages).toHaveLength(3);
      expect(processedEvents[0]).toHaveProperty("parseFailureCount", 0);
      expect(processedEvents[0]).toHaveProperty("parseSuccessCount", 3);
      expect(processedEvents[0]).toHaveProperty("parseFailure", {});
      expect(processedEvents[0]).toHaveProperty("testEventsNDJSON", "{\"patientName\":\"Dexter\"}\n{\"patientName\":\"Dee Dee\"}\n{\"patientName\":\"Mandark\"}");
    });

    it("process data with no failures and returns multiple bundles", () => {
      const processedEvents = processTestEvents(validMessages, 25);
      expect(processedEvents).toHaveLength(3);
      // bundle 1
      expect(processedEvents[0]).toHaveProperty("messages");
      expect(processedEvents[0].messages).toHaveLength(1);
      expect(processedEvents[0]).toHaveProperty("parseFailureCount", 0);
      expect(processedEvents[0]).toHaveProperty("parseSuccessCount", 1);
      expect(processedEvents[0]).toHaveProperty("parseFailure", {});
      expect(processedEvents[0]).toHaveProperty("testEventsNDJSON", "{\"patientName\":\"Dexter\"}");
      // bundle 2
      expect(processedEvents[1]).toHaveProperty("messages");
      expect(processedEvents[1].messages).toHaveLength(1);
      expect(processedEvents[1]).toHaveProperty("parseFailureCount", 0);
      expect(processedEvents[1]).toHaveProperty("parseSuccessCount", 1);
      expect(processedEvents[1]).toHaveProperty("parseFailure", {});
      expect(processedEvents[1]).toHaveProperty("testEventsNDJSON", "{\"patientName\":\"Dee Dee\"}");
      // bundle 3
      expect(processedEvents[2]).toHaveProperty("messages");
      expect(processedEvents[2].messages).toHaveLength(1);
      expect(processedEvents[2]).toHaveProperty("parseFailureCount", 0);
      expect(processedEvents[2]).toHaveProperty("parseSuccessCount", 1);
      expect(processedEvents[2]).toHaveProperty("parseFailure", {});
      expect(processedEvents[2]).toHaveProperty("testEventsNDJSON", "{\"patientName\":\"Mandark\"}");
    });

    it('returns empty array when no messages are passed',()=>{
      const processedEvents = processTestEvents([], 100);
      expect(processedEvents).toHaveLength(0);
    });

    it('returns empty ndjson when all messages fail to be parsed',()=>{
      const mixedMessages: DequeuedMessageItem[] = [
        {
          messageId: "1",
          messageText: "not_a_json",
        } as jest.MockedObject<DequeuedMessageItem>,
        {
          messageId: "2",
          messageText: JSON.stringify({ patientName: "Dexter" }),
        } as jest.MockedObject<DequeuedMessageItem>,
      ];
      const processedEvents = processTestEvents(mixedMessages, 100);
      expect(processedEvents).toHaveLength(1);
      expect(processedEvents[0]).toHaveProperty("messages");
      expect(processedEvents[0].messages).toHaveLength(2);
      expect(processedEvents[0]).toHaveProperty("parseFailureCount", 1);
      expect(processedEvents[0]).toHaveProperty("parseSuccessCount", 1);
      expect(processedEvents[0]).toHaveProperty("parseFailure", {"1":true});
      expect(processedEvents[0]).toHaveProperty("testEventsNDJSON", "{\"patientName\":\"Dexter\"}");
    });

    it('returns ndjson with only successfully parsed messages',()=>{
      const invalidMessages: DequeuedMessageItem[] = [
        {
          messageId: "1",
          messageText: "not_a_json",
        } as jest.MockedObject<DequeuedMessageItem>,
        {
          messageId: "2",
          messageText: "not_a_json",
        } as jest.MockedObject<DequeuedMessageItem>,
        {
          messageId: "3",
          messageText: "not_a_json",
        } as jest.MockedObject<DequeuedMessageItem>,
      ];
      const processedEvents = processTestEvents(invalidMessages, 100);
      expect(processedEvents).toHaveLength(1);
      expect(processedEvents[0]).toHaveProperty("messages");
      expect(processedEvents[0].messages).toHaveLength(3);
      expect(processedEvents[0]).toHaveProperty("parseFailureCount", 3);
      expect(processedEvents[0]).toHaveProperty("parseSuccessCount", 0);
      expect(processedEvents[0]).toHaveProperty("parseFailure", {"1":true, "2":true,"3":true});
      expect(processedEvents[0]).toHaveProperty("testEventsNDJSON", "");
    });

    it('returns correct bundles and properties when mixed messages are passed',()=>{
      const mixedMessages = [...validMessages,  {
        messageId: "4",
        messageText: "not_a_json",
      } as jest.MockedObject<DequeuedMessageItem>,]

      const processedEvents = processTestEvents(mixedMessages, 50);
      expect(processedEvents).toHaveLength(2);
      //bundle 1 all valid
      expect(processedEvents[0]).toHaveProperty("messages");
      expect(processedEvents[0].messages).toHaveLength(2);
      expect(processedEvents[0]).toHaveProperty("parseFailureCount", 0);
      expect(processedEvents[0]).toHaveProperty("parseSuccessCount", 2);
      expect(processedEvents[0]).toHaveProperty("parseFailure", {});
      expect(processedEvents[0]).toHaveProperty("testEventsNDJSON", "{\"patientName\":\"Dexter\"}\n{\"patientName\":\"Dee Dee\"}");
      //bundle 2 some invalid
      expect(processedEvents[1]).toHaveProperty("messages");
      expect(processedEvents[1].messages).toHaveLength(2);
      expect(processedEvents[1]).toHaveProperty("parseFailureCount", 1);
      expect(processedEvents[1]).toHaveProperty("parseSuccessCount", 1);
      expect(processedEvents[1]).toHaveProperty("parseFailure", {"4":true});
      expect(processedEvents[1]).toHaveProperty("testEventsNDJSON", "{\"patientName\":\"Mandark\"}");
    });
  });
});
