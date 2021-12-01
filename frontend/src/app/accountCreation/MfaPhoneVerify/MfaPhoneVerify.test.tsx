import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Switch } from "react-router";

import { MfaComplete } from "../MfaComplete/MfaComplete";

import { MfaPhoneVerify } from "./MfaPhoneVerify";

jest.mock("../AccountCreationApiService", () => ({
  AccountCreationApi: {
    enrollSecurityKeyMfa: () => {
      return new Promise((res) => {
        res({ activation: { challenge: "challenge", user: { id: "userId" } } });
      });
    },
    verifyActivationPasscode: (code: string) => {
      return new Promise((res, rej) => {
        if (code === "123456") {
          res("success");
        } else {
          rej("incorrect code");
        }
      });
    },
  },
}));

describe("Verify Phone MFA", () => {
  beforeEach(() => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/mfa-phone/verify",
            state: { contact: "530-867-5309" },
          },
        ]}
      >
        <Switch>
          <Route path="/mfa-phone/verify" component={MfaPhoneVerify} />
          <Route path="/success" component={MfaComplete} />
        </Switch>
      </MemoryRouter>
    );
  });

  it("can submit a valid security code", async () => {
    expect(
      screen.getByText("530-867-5309", { exact: false })
    ).toBeInTheDocument();
    userEvent.type(
      screen.getByLabelText("One-time security code", { exact: false }),
      "123456"
    );
    userEvent.click(screen.getByText("Submit"));
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
      screen.getByText("530-867-5309", { exact: false })
    ).toBeInTheDocument();
    userEvent.type(
      screen.getByLabelText("One-time security code", { exact: false }),
      "999999"
    );
    userEvent.click(screen.getByText("Submit"));
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

  it("requires a security code to be entered", () => {
    userEvent.click(screen.getByText("Submit"));
    expect(screen.getByText("Enter your security code")).toBeInTheDocument();
    expect(
      screen.queryByText(
        "To start using SimpleReport, visit the website to log in to your account."
      )
    ).not.toBeInTheDocument();
  });
});
