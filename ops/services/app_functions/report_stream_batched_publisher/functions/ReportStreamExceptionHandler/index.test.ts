import { queueTrigger } from "./index";
import { InvocationContext } from "@azure/functions";

import fetch from "node-fetch";
import fetchMock from "jest-fetch-mock";
import { ReportStreamCallbackRequest } from "../common/types";

jest.mock(
  "node-fetch",
  jest.fn(() => require("jest-fetch-mock")),
);

jest.mock("../config", () => ({
  ENV: {
    SIMPLE_REPORT_CB_URL: "https://nope.url/1234",
    SIMPLE_REPORT_CB_TOKEN: "octopus",
  },
}));

describe("main function export", () => {
  const context = {
    error: jest.fn(),
    log: jest.fn(),
    traceContext: { traceParent: "asdf" },
  } as jest.MockedObject<InvocationContext>;

  it("calls the SimpleReport webhook API", async () => {
    // GIVEN
    const queueItem = {} as jest.MockedObject<ReportStreamCallbackRequest>;
    fetchMock.mockResponseOnce("asdf");

    // WHEN
    queueTrigger(queueItem, context);

    // THEN
    expect(fetch).toHaveBeenCalled();
  });

  it("throws if SimpleReport webhook API does not return 2xx", async () => {
    // GIVEN
    const queueItem = {} as jest.MockedObject<ReportStreamCallbackRequest>;
    fetchMock.mockResponseOnce("", { status: 500 });

    // WHEN
    const promise = queueTrigger(queueItem, context);

    // THEN
    await expect(promise).rejects.toThrowError();
    expect(fetch).toHaveBeenCalled();
  });
});
