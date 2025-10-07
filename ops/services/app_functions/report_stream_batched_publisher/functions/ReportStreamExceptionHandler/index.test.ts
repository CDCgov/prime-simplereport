import queueTrigger from "./index";
import { Context } from "@azure/functions";

import fetch from "node-fetch";
import fetchMock from "jest-fetch-mock";

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
    log: jest.fn(),
    traceContext: { traceparent: "asdf" },
  } as jest.MockedObject<Context>;
  context.log.error = jest.fn();

  it("calls the SimpleReport webhook API", async () => {
    // GIVEN
    const queueItem = "irrelevant";
    fetchMock.mockResponseOnce("asdf");

    // WHEN
    queueTrigger(context, queueItem);

    // THEN
    expect(fetch).toHaveBeenCalled();
  });

  it("throws if SimpleReport webhook API does not return 2xx", async () => {
    // GIVEN
    const queueItem = "irrelephant";
    fetchMock.mockResponseOnce("", { status: 500 });

    // WHEN
    const promise = queueTrigger(context, queueItem);

    // THEN
    await expect(promise).rejects.toThrowError();
    expect(fetch).toHaveBeenCalled();
  });
});
