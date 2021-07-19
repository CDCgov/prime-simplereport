import { render } from "@testing-library/react";
import { MemoryRouter, Router } from "react-router-dom";
import { createMemoryHistory } from "history";

import VersionEnforcer from "./VersionEnforcer";
import { VersionService } from "./VersionService";

jest.mock("./VersionService", () => ({
  VersionService: {
    enforce: jest.fn(),
  },
}));

describe("VersionEnforcer", () => {
  it("calls VersionService.enforce() on load", () => {
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

  it("calls VersionService.enforce() on route change", async () => {
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
    expect(VersionService.enforce).toHaveBeenCalledTimes(2);
  });
});
