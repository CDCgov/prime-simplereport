import {
  act,
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { MfaComplete } from "../MfaComplete/MfaComplete";

import { MfaOktaVerify } from "./MfaOktaVerify";

jest.mock("../AccountCreationApiService", () => ({
  AccountCreationApi: {
    enrollSecurityKeyMfa: () => {
      return new Promise((res) => {
        setTimeout(
          () =>
            res({
              activation: { challenge: "challenge", user: { id: "userId" } },
            }),
          200
        );
      });
    },
    verifyActivationPasscode: (code: string) => {
      return new Promise((res, rej) => {
        if (code === "123456") {
          setTimeout(() => res("success"), 200); // adding delay so we can test loading state
        } else {
          setTimeout(() => rej("incorrect code"), 200);
        }
      });
    },
  },
}));

describe("Verify Okta MFA", () => {
  beforeEach(() => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/mfa-okta/verify",
          },
        ]}
      >
        <Routes>
          <Route path="/mfa-okta/verify" element={<MfaOktaVerify />} />
          <Route path="/success" element={<MfaComplete />} />
        </Routes>
      </MemoryRouter>
    );
  });

  it("can submit a valid security code", async () => {
    expect(
      screen.getByText("Enter a code from the Okta Verify app.", {
        exact: false,
      })
    ).toBeInTheDocument();
    await act(
      async () =>
        await userEvent.type(
          screen.getByLabelText("One-time security code", { exact: false }),
          "123456"
        )
    );
    await act(async () => await userEvent.click(screen.getByText("Submit")));
    await waitForElementToBeRemoved(() =>
      screen.queryByText("Verifying security code …")
    );

    expect(
      screen.queryByText("Enter your security code")
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(
        "To start using SimpleReport, visit the website to log in to your account."
      )
    ).toBeInTheDocument();
  });

  it("shows an error for an invalid security code", async () => {
    expect(
      screen.getByText("Enter a code from the Okta Verify app.", {
        exact: false,
      })
    ).toBeInTheDocument();
    await act(
      async () =>
        await userEvent.type(
          screen.getByLabelText("One-time security code", { exact: false }),
          "999999"
        )
    );
    await act(async () => await userEvent.click(screen.getByText("Submit")));
    await waitForElementToBeRemoved(() =>
      screen.queryByText("Verifying security code …")
    );

    expect(screen.getByText("incorrect code")).toBeInTheDocument();
    expect(
      screen.queryByText(
        "To start using SimpleReport, visit the website to log in to your account."
      )
    ).not.toBeInTheDocument();
  });

  it("requires a security code to be entered", async () => {
    await act(async () => await userEvent.click(screen.getByText("Submit")));
    expect(screen.getByText("Enter your security code")).toBeInTheDocument();
    expect(
      screen.queryByText(
        "To start using SimpleReport, visit the website to log in to your account."
      )
    ).not.toBeInTheDocument();
  });
});
