import { Context } from "@azure/functions";
import { DequeuedMessageItem, QueueClient } from "@azure/storage-queue";
import * as appInsights from "applicationinsights";

import * as dataHandlers from "./dataHandlers";
import * as queueHandlers from "../common/queueHandlers";
import * as reportingHandlers from "../common/reportingHandlers";
import FHIRTestEventReporter from "./index";
import { FHIRTestEventsBatch } from "./dataHandlers";
import { ReportStreamResponse } from "../common/types";

jest.mock("../config", () => ({
  ENV: {
    AZ_STORAGE_QUEUE_SVC_URL: "hello",
    AZ_STORAGE_ACCOUNT_NAME: "hola",
    AZ_STORAGE_ACCOUNT_KEY: "bonjour",
    REPORT_STREAM_URL: "https://nope.url/1234",
    FHIR_TEST_EVENT_QUEUE_NAME: "ciao",
    FHIR_PUBLISHING_ERROR_QUEUE_NAME: "ciao_error",
    REPORTING_EXCEPTION_QUEUE_NAME: "ciao_exception",
  },
}));

jest.mock(
  "applicationinsights",
  jest.fn().mockImplementation(() => ({
    setup: jest.fn(),
    defaultClient: {
      trackEvent: jest.fn(),
      trackDependency: jest.fn(),
    },
  })),
);

describe("FHIRTestEventReporter", () => {
  const context = {
    log: jest.fn(),
    traceContext: { traceparent: "asdf" },
  } as jest.MockedObject<Context>;
  context.log.error = jest.fn();

  const responseMock = {
    ok: true,
    status: 200,
    formData: jest.fn().mockResolvedValue(""),
    text: jest.fn().mockResolvedValue(""),
    json: jest.fn().mockResolvedValue({
      warnings: [],
      errors: [],
    } as jest.MockedObject<ReportStreamResponse>),
  };

  const mockDequeuedTestEvents = [
    {
      messageId: "1",
      popReceipt: "abcd",
      messageText: '{"Result_ID" : 1}',
    },
  ] as jest.MockedObject<DequeuedMessageItem[]>;

  let dequeueMessagesSpy,
    getQueueClientSpy,
    minimumMessagesAvailableSpy,
    processTestEventsSpy,
    reportToUniversalPipelineSpy,
    handleReportStreamResponseSpy,
    getReportStreamAuthTokenSpy;

  beforeEach(() => {
    dequeueMessagesSpy = jest
      .spyOn(queueHandlers, "dequeueMessages")
      .mockResolvedValue([]);
    getQueueClientSpy = jest
      .spyOn(queueHandlers, "getQueueClient")
      .mockImplementation(
        (queueName: string) =>
          ({
            name: queueName,
            getProperties: jest.fn().mockResolvedValue({
              approximateMessagesCount: 10,
            }),
          }) as jest.MockedObject<QueueClient>,
      );
    minimumMessagesAvailableSpy = jest
      .spyOn(queueHandlers, "minimumMessagesAvailable")
      .mockResolvedValue(true);
    processTestEventsSpy = jest.spyOn(dataHandlers, "processTestEvents");
    reportToUniversalPipelineSpy = jest.spyOn(
      reportingHandlers,
      "reportToUniversalPipelineTokenBased",
    );
    handleReportStreamResponseSpy = jest
      .spyOn(reportingHandlers, "handleReportStreamResponse")
      .mockResolvedValue();
    getReportStreamAuthTokenSpy = jest
      .spyOn(reportingHandlers, "getReportStreamAuthToken")
      .mockResolvedValue("123abc");
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("checks queue when there are no messages", async () => {
    minimumMessagesAvailableSpy.mockResolvedValueOnce(false);

    await FHIRTestEventReporter(context);

    expect(minimumMessagesAvailableSpy).toHaveBeenCalled();
    expect(dequeueMessagesSpy).not.toHaveBeenCalled();
    expect(processTestEventsSpy).not.toHaveBeenCalled();
    expect(reportToUniversalPipelineSpy).not.toHaveBeenCalledTimes(1);
    expect(handleReportStreamResponseSpy).not.toHaveBeenCalledTimes(1);
    expect(context.log).not.toHaveBeenCalled();
  });

  it("checks queue but dequeues 0 messages", async () => {
    dequeueMessagesSpy.mockResolvedValueOnce([]);

    await FHIRTestEventReporter(context);

    expect(getReportStreamAuthTokenSpy).not.toHaveBeenCalled();
    expect(reportToUniversalPipelineSpy).not.toHaveBeenCalled();
    expect(context.log).toHaveBeenCalledWith(
      "Queue: ciao. Messages Dequeued: 0; aborting.",
    );
  });

  it("parses and uploads the test events successfully", async () => {
    const fhirTestEventsBatches: FHIRTestEventsBatch[] = [
      {
        messages: [
          {
            messageId: "1",
            messageText: JSON.stringify({ patientName: "Dexter" }),
          } as jest.MockedObject<DequeuedMessageItem>,
        ],
        parseFailure: {},
        parseFailureCount: 0,
        parseSuccessCount: 1,
        testEventsNDJSON: JSON.stringify({ patient: "dexter" }),
      },
    ];

    dequeueMessagesSpy.mockResolvedValueOnce([mockDequeuedTestEvents]); // to pass the messages check
    processTestEventsSpy.mockReturnValueOnce(fhirTestEventsBatches);
    reportToUniversalPipelineSpy.mockResolvedValueOnce(responseMock);

    await FHIRTestEventReporter(context);

    expect(getQueueClientSpy).toHaveBeenCalledTimes(3);
    expect(minimumMessagesAvailableSpy).toHaveBeenCalled();
    expect(dequeueMessagesSpy).toHaveBeenCalled();
    expect(processTestEventsSpy).toHaveBeenCalled();

    expect(getReportStreamAuthTokenSpy).toHaveBeenCalledWith(context);
    expect(reportToUniversalPipelineSpy).toHaveBeenCalledWith(
      "123abc",
      '{"patient":"dexter"}',
    );
    expect(reportToUniversalPipelineSpy).toHaveBeenCalledTimes(1);
    expect(handleReportStreamResponseSpy).toHaveBeenCalledTimes(1);
  });

  it("receives failed parsed events after processing them", async () => {
    const fhirTestEventsBatches: FHIRTestEventsBatch[] = [
      {
        messages: [
          {
            messageId: "1",
            messageText: JSON.stringify({ patientName: "Dexter" }),
          } as jest.MockedObject<DequeuedMessageItem>,
        ],
        parseFailure: { "1": true },
        parseFailureCount: 1,
        parseSuccessCount: 0,
        testEventsNDJSON: "",
      },
    ];

    dequeueMessagesSpy.mockResolvedValueOnce([mockDequeuedTestEvents]); // to pass the messages check
    processTestEventsSpy.mockReturnValueOnce(fhirTestEventsBatches);
    reportToUniversalPipelineSpy.mockResolvedValueOnce(responseMock);

    await FHIRTestEventReporter(context);
    expect(appInsights.defaultClient.trackEvent).toHaveBeenCalledTimes(2);
    expect(appInsights.defaultClient.trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Queue:ciao. Test Event Parse Failure" }),
    );
    expect(reportToUniversalPipelineSpy).not.toHaveBeenCalled();
    expect(context.log).toHaveBeenCalledWith(
      "Queue: ciao. Successfully parsed message count of 0 in batch 1 is less than 1; aborting",
    );
  });

  it("throws exception when at least one of the batches is not published successfully", async () => {
    const fhirTestEventsBatches: FHIRTestEventsBatch[] = [
      {
        messages: [
          {
            messageId: "1",
            messageText: JSON.stringify({ patientName: "Dexter" }),
          } as jest.MockedObject<DequeuedMessageItem>,
        ],
        parseFailure: {},
        parseFailureCount: 0,
        parseSuccessCount: 1,
        testEventsNDJSON: JSON.stringify({ patient: "dexter" }),
      },
    ];

    const errorResponseMock = {
      ok: false,
      status: 400,
      formData: jest.fn().mockResolvedValue(""),
      text: jest.fn().mockResolvedValue(""),
      json: jest.fn().mockResolvedValue({
        errorCount: 1,
        warningCount: 0,
        warnings: [],
        errors: [{ scope: "report", message: "something is not right" }],
      } as jest.MockedObject<ReportStreamResponse>),
    };

    dequeueMessagesSpy.mockResolvedValueOnce([mockDequeuedTestEvents]); // to pass the messages check
    processTestEventsSpy.mockReturnValueOnce(fhirTestEventsBatches);
    reportToUniversalPipelineSpy.mockRejectedValueOnce(errorResponseMock);

    await expect(() => FHIRTestEventReporter(context)).rejects.toThrow(
      JSON.stringify([{ ok: false, status: 400 }]),
    );
  });
});
