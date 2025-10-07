import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Link, MemoryRouter, Outlet, Route, Routes } from "react-router-dom";

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
        <Routes>
          <Route path="/" element={<VersionEnforcer />} />
        </Routes>
      </MemoryRouter>
    );

    // THEN
    expect(VersionService.enforce).toHaveBeenCalled();
  });

  it("calls VersionService.enforce() on route change", async () => {
    // GIVEN
    render(
      <MemoryRouter>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <VersionEnforcer />
                <Outlet />
              </>
            }
          >
            <Route
              path="/"
              element={
                <>
                  <p>This is the first page</p>
                  <Link to="some-new-route">Go to a new page</Link>
                </>
              }
            />
            <Route
              path="some-new-route"
              element={<div>Went to a new page!</div>}
            />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    expect(await screen.findByText("This is the first page", { exact: false }));

    // WHEN
    await act(
      async () =>
        await userEvent.click(
          screen.getByText("Go to a new page", { exact: false })
        )
    );

    // THEN
    expect(await screen.findByText("Went to a new page!", { exact: false }));
    expect(VersionService.enforce).toHaveBeenCalledTimes(2);
  });
});
