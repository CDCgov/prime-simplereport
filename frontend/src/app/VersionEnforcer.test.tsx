import { any } from "prop-types";

import * as VersionEnforcer from "./VersionEnforcer";

describe("VersionEnforcer", () => {
  let getCurrentShaMock: jest.Mock;
  let reloadMock: jest.Mock;

  beforeEach(() => {
    jest.mock("./VersionService", () => ({
      VersionService: {
        getCurrentSHA: (getCurrentShaMock = jest.fn(
          () => process.env.REACT_APP_CURRENT_COMMIT
        )),
        reload: jest.fn(),
      },
    }));
  });

  it("calls VersionService.getCurrentSHA() on route change", () => {
    fail("todo");
  });

  it("calls VersionService.reload() when the SHA has changed", () => {
    fail("todo");
  });
});
