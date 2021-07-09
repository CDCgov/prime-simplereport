import { render } from "@testing-library/react";
import { MemoryRouter, Router } from "react-router-dom";
import { createMemoryHistory } from "history";

import VersionEnforcer from "./VersionEnforcer";
import { VersionService } from "./VersionService";
import reload from "./utils/reload";

jest.mock("./utils/reload");

jest.mock("./VersionService", () => ({
  VersionService: {
    getSHA: jest.fn(() => process.env.REACT_APP_CURRENT_COMMIT),
    reload: jest.fn(),
  },
}));

describe("VersionEnforcer", () => {
  it("calls VersionService.getCurrentSHA() on load", () => {
    // GIVEN
    // WHEN
    render(
      <MemoryRouter>
        <VersionEnforcer />
      </MemoryRouter>
    );

    // THEN
    expect(VersionService.enforce).toHaveBeenCalled();
  });

  it("calls VersionService.getCurrentSHA() on route change", async () => {
    // GIVEN
    const history = createMemoryHistory();
    const route = "/some-route";
    history.push(route);
    render(
      <Router history={history}>
        <VersionEnforcer />
      </Router>
    );

    // WHEN
    history.push("/some-new-route");
    await new Promise((resolve) => setTimeout(resolve, 0));

    // THEN
    expect(VersionService.getSHA).toHaveBeenCalledTimes(2);
  });

  it("calls VersionService.reload() when the SHA has changed", async () => {
    // GIVEN
    (VersionService.getSHA as any).mockImplementation(
      () => Promise.resolve("SHAs are not watermelons") // clearly different from whatever is in the build
    );

    // WHEN
    render(
      <MemoryRouter>
        <VersionEnforcer />
      </MemoryRouter>
    );
    await new Promise((resolve) => setTimeout(resolve, 0));

    // THEN
    expect(reload as jest.Mock).toHaveBeenCalled();
  });
});
