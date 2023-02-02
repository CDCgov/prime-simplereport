import { Context } from "@azure/functions";
import { QueueClient } from "@azure/storage-queue";

import * as dataHandlers from "./dataHandlers";
import * as queueHandlers from "../common/queueHandlers";
import * as reportingHandlers from "../common/reportingHandlers";
import FHIRTestEventReporter from "./index";
import { ProcessedTestEvents } from "./dataHandlers";
import { ReportStreamResponse } from "../common/rs-response";

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
  }))
);

describe("FHIRTestEventReporter", () => {
  const context = {
    log: jest.fn(),
    traceContext: { traceparent: "asdf" },
  } as jest.MockedObject<Context>;

  const responseMock: Response = {
    ok: true,
    status: 200,
    text: jest.fn().mockResolvedValue(""),
    json: jest.fn().mockResolvedValue({
      warnings: [],
      errors: [],
    } as jest.MockedObject<ReportStreamResponse>),
  } as jest.MockedObject<Response>;

  let dequeueMessagesSpy,
    getQueueClientSpy,
    minimumMessagesAvailableSpy,
    processTestEventsSpy,
    reportToUniversalPipelineSpy,
    handleReportStreamResponseSpy;

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
          } as jest.MockedObject<QueueClient>)
      );
    minimumMessagesAvailableSpy = jest
      .spyOn(queueHandlers, "minimumMessagesAvailable")
      .mockResolvedValue(true);
    processTestEventsSpy = jest.spyOn(dataHandlers, "processTestEvents");
    reportToUniversalPipelineSpy = jest.spyOn(
      reportingHandlers,
      "reportToUniversalPipeline"
    );
    handleReportStreamResponseSpy = jest
      .spyOn(reportingHandlers, "handleReportStreamResponse")
      .mockResolvedValue();
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

  it("parses and uploads the test events successfully", async () => {
    const processedTestEventsMock: ProcessedTestEvents = {
      testEvents: [{ patient: "dexter" }],
      parseFailure: {},
      parseFailureCount: 0,
      parseSuccessCount: 1,
    };

    processTestEventsSpy.mockReturnValueOnce(processedTestEventsMock);
    reportToUniversalPipelineSpy.mockResolvedValueOnce(responseMock);

    await FHIRTestEventReporter(context);

    expect(getQueueClientSpy).toHaveBeenCalledTimes(3);
    expect(minimumMessagesAvailableSpy).toHaveBeenCalled();
    expect(dequeueMessagesSpy).toHaveBeenCalled();
    expect(processTestEventsSpy).toHaveBeenCalled();

    // The submission to report stream will be done with ticket 5115
    expect(reportToUniversalPipelineSpy).toHaveBeenCalledWith(
      processedTestEventsMock.testEvents
    );
    expect(reportToUniversalPipelineSpy).toHaveBeenCalledTimes(1);
    expect(handleReportStreamResponseSpy).toHaveBeenCalledTimes(1);
  });

  it("receives failed parsed events after processing them", async () => {
    const processedTestEventsMock: ProcessedTestEvents = {
      testEvents: [],
      parseFailure: { "1": true },
      parseFailureCount: 1,
      parseSuccessCount: 0,
    };

    processTestEventsSpy.mockReturnValueOnce(processedTestEventsMock);
    reportToUniversalPipelineSpy.mockResolvedValueOnce(responseMock);

    await FHIRTestEventReporter(context);

    expect(reportToUniversalPipelineSpy).not.toHaveBeenCalled();
    expect(context.log).toHaveBeenCalledWith(
      "Queue: ciao. Successfully parsed message count of 0 is less than 1; aborting"
    );
  });
});
