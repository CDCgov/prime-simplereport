import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import Consent from "./Consent";

describe("Consent", () => {
  beforeEach(() => {
    render(
      <MemoryRouter
        initialEntries={[
          { pathname: "/identity-verification", search: "?orgExternalId=foo" },
        ]}
      >
        <Consent />
      </MemoryRouter>
    );
  });
  it("initializes with the submit button enabled", () => {
    expect(screen.getByText("I agree")).not.toHaveAttribute("disabled");
  });
  it("initializes to an error page if no org id is passed", () => {
    render(
      <MemoryRouter>
        <Consent />
      </MemoryRouter>
    );
    expect(
      screen.getByText("We weren't able to find your affiliated organization", {
        exact: false,
      })
    ).toBeInTheDocument();
  });
});
