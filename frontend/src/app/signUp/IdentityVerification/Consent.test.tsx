import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Consent from "./Consent";

jest.mock("react-router-dom", () => {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    Navigate: (props: any) => `Redirected to ${props.to}`,
  };
});

const renderContainer = () =>
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

describe("Consent", () => {
  it("initializes with the submit button enabled", () => {
    renderContainer();
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

  it("shows Identity verification consent when agreed", () => {
    renderContainer();
    fireEvent.click(screen.getByText("I agree"));
    expect(screen.getByText("Why we verify your identity")).toBeInTheDocument();
  });
});
