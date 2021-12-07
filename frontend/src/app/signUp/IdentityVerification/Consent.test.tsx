import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import Consent from "./Consent";

jest.mock("react-router-dom", () => ({
  Redirect: (props: any) => `Redirected to ${props.to.pathname}`,
}));

describe("Consent", () => {
  beforeEach(() => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/identity-verification",
            state: {
              firstName: "Harry",
              lastName: "Potter",
              orgExternalId: "Hogwarts",
            },
          },
        ]}
      >
        <Consent />
      </MemoryRouter>
    );
  });
  it("initializes with the submit button enabled", () => {
    expect(screen.getByText("I agree")).toBeEnabled();
  });

  it("redirects to sign-up page when it doesnt get org id and user info", () => {
    render(
      <MemoryRouter>
        <Consent />
      </MemoryRouter>
    );

    expect(screen.getByText("Redirected to /sign-up")).toBeInTheDocument();
  });
});
