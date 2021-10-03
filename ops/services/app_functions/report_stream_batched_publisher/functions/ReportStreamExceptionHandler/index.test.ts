import queueTrigger from "./index";
import fetchMock, { enableFetchMocks } from "jest-fetch-mock";
import { Context } from "@azure/functions";
enableFetchMocks();

describe("main function export", () => {
  const context: Context = {
    log: jest.fn(),
    traceContext: { traceparent: "asdf" },
  } as any;
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
