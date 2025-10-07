import { Link, MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Prompt from "./Prompt";

describe("A <Prompt>", () => {
  it("calls window.confirm with the prompt message", async () => {
    const confirmMock = jest
      .spyOn(window, "confirm")
      .mockImplementation((_message) => false);

    render(
      <MemoryRouter>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Prompt message="Are you sure?" when={true} />
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
    expect(screen.getByText("This is the first page")).toBeInTheDocument();

    // WHEN
    await act(
      async () => await userEvent.click(screen.getByText("Go to a new page"))
    );

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

    render(
      <MemoryRouter>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Prompt message="Are you sure?" when={true} />
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
    expect(screen.getByText("This is the first page")).toBeInTheDocument();

    // WHEN
    await act(
      async () => await userEvent.click(screen.getByText("Go to a new page"))
    );

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

    render(
      <MemoryRouter>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Prompt message="Are you sure?" when={false} />
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
    expect(screen.getByText("This is the first page")).toBeInTheDocument();

    // WHEN
    await act(
      async () => await userEvent.click(screen.getByText("Go to a new page"))
    );

    // THEN
    expect(screen.getByText("Went to a new page!")).toBeInTheDocument();

    expect(confirmMock).not.toHaveBeenCalled();
  });
});
