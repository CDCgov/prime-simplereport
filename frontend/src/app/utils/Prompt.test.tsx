import {
  createMemoryRouter,
  createRoutesFromElements,
  Link,
  Outlet,
  Route,
  RouterProvider,
} from "react-router-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import Prompt from "./Prompt";

describe("A <Prompt>", () => {
  function renderWithUser(showPrompt: boolean) {
    const routes = createRoutesFromElements(
      <>
        <Route
          path="/"
          element={
            <>
              <Prompt message="Are you sure?" when={showPrompt} />
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
      </>
    );
    const router = createMemoryRouter(routes);
    return {
      user: userEvent.setup(),
      ...render(<RouterProvider router={router} />),
    };
  }

  it("calls window.confirm with the prompt message", async () => {
    const confirmMock = jest
      .spyOn(window, "confirm")
      .mockImplementation((_message) => false);

    const { user } = renderWithUser(true);
    expect(screen.getByText("This is the first page")).toBeInTheDocument();

    // WHEN
    await user.click(screen.getByText("Go to a new page"));

    // THEN
    expect(screen.queryByText("Went to a new page!")).not.toBeInTheDocument();

    expect(confirmMock).toHaveBeenCalledWith(
      expect.stringMatching("Are you sure?")
    );
  });

  it("calls window.confirm with the prompt message, and redirects when confirmed", async () => {
    const confirmMock = jest
      .spyOn(window, "confirm")
      .mockImplementation((_message) => true);

    const { user } = renderWithUser(true);
    expect(screen.getByText("This is the first page")).toBeInTheDocument();

    // WHEN
    await user.click(screen.getByText("Go to a new page"));

    // THEN
    expect(confirmMock).toHaveBeenCalledWith(
      expect.stringMatching("Are you sure?")
    );

    expect(screen.getByText("Went to a new page!")).toBeInTheDocument();
  });

  it("does not call window.confirm with when=false", async () => {
    const confirmMock = jest
      .spyOn(window, "confirm")
      .mockImplementation((_message) => true);

    const { user } = renderWithUser(false);
    expect(screen.getByText("This is the first page")).toBeInTheDocument();

    // WHEN
    await user.click(screen.getByText("Go to a new page"));

    // THEN
    expect(screen.getByText("Went to a new page!")).toBeInTheDocument();

    expect(confirmMock).not.toHaveBeenCalled();
  });
});
