import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import { LinkWithQuery } from "../LinkWithQuery";

describe("LinkWithQuery", () => {
  it("adds query params to a link", async () => {
    const { findByRole } = render(
      <MemoryRouter initialEntries={["/home?foo=bar"]} initialIndex={0}>
        <LinkWithQuery to="/some/route">Go to route</LinkWithQuery>
      </MemoryRouter>
    );
    const link = await findByRole("link");
    expect(link.getAttribute("href")?.split("?")[1]).toBe("foo=bar");
  });
  it("leaves links alone if there are no query params", async () => {
    const { findByRole } = render(
      <MemoryRouter initialEntries={["/home"]} initialIndex={0}>
        <LinkWithQuery to="/some/route">Go to route</LinkWithQuery>
      </MemoryRouter>
    );
    const link = await findByRole("link");
    expect(link.getAttribute("href")).toBe("/some/route");
  });
});
