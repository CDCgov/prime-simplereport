import { InvocationContext, Timer } from "@azure/functions";
import * as appInsights from "applicationinsights";

import { SendToAIMS } from "./index";

jest.mock("@azure/functions", () => ({
  ...jest.requireActual("@azure/functions"),
  app: {
    timer: jest.fn(),
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

describe("SendToAIMS", () => {
  const context = {
    error: jest.fn(),
    log: jest.fn(),
    traceContext: { traceParent: "asdf" },
  } as jest.MockedObject<InvocationContext>;

  const timer = {} as jest.MockedObject<Timer>;

  it("has a test file so that deploys will work", async () => {
    // build fails if no test files
    // to be replaced when SendToAIMS function has actual functionality
    await SendToAIMS(timer, context);

    expect(appInsights.defaultClient.trackEvent).toHaveBeenCalledTimes(1);
    expect(context.log).toHaveBeenCalledWith("Sent a telemetry event");
  });
});
