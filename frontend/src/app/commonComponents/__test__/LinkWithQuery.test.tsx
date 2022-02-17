import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { LinkWithQuery } from "../LinkWithQuery";

describe("LinkWithQuery", () => {
  it("adds query params to a link", async () => {
    render(
      <MemoryRouter initialEntries={["/home?foo=bar"]} initialIndex={0}>
        <LinkWithQuery to="/some/route">Go to route</LinkWithQuery>
      </MemoryRouter>
    );
    const link = await screen.findByRole("link");
    expect(link.getAttribute("href")?.split("?")[1]).toBe("foo=bar");
  });
  it("leaves links alone if there are no query params", async () => {
    render(
      <MemoryRouter initialEntries={["/home"]} initialIndex={0}>
        <LinkWithQuery to="/some/route">Go to route</LinkWithQuery>
      </MemoryRouter>
    );
    const link = await screen.findByRole("link");
    expect(link).toHaveAttribute("href", "/some/route");
  });
});
