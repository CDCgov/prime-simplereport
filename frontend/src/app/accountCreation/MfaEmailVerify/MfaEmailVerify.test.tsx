import { render, screen, fireEvent } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { MemoryRouter, Route, Switch } from "react-router";

import { MfaComplete } from "../MfaComplete/MfaComplete";

import { MfaEmailVerify } from "./MfaEmailVerify";

jest.mock("../AccountCreationApiService", () => ({
  AccountCreationApi: {
    enrollSecurityKeyMfa: () => {
      return new Promise((res) => {
        res({ activation: { challenge: "challenge", user: { id: "userId" } } });
      });
    },
    enrollEmailMfa: () => {},
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

describe("Verify Email MFA", () => {
  beforeEach(() => {
    render(
      <MemoryRouter initialEntries={["/mfa-email/verify"]}>
        <Switch>
          <Route path="/mfa-email/verify" component={MfaEmailVerify} />
          <Route path="/success" component={MfaComplete} />
        </Switch>
      </MemoryRouter>
    );
  });

  it("can submit a valid security code", async () => {
    expect(
      screen.getByText(
        "We’ve sent you an email with a one-time security code.",
        { exact: false }
      )
    ).toBeInTheDocument();
    fireEvent.change(
      screen.getByLabelText("One-time security code", { exact: false }),
      {
        target: { value: "123456" },
      }
    );
    await act(async () => {
      await fireEvent.click(screen.getByText("Submit"));
    });
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
      screen.getByText(
        "We’ve sent you an email with a one-time security code.",
        { exact: false }
      )
    ).toBeInTheDocument();
    fireEvent.change(
      screen.getByLabelText("One-time security code", { exact: false }),
      {
        target: { value: "999999" },
      }
    );
    await act(async () => {
      await fireEvent.click(screen.getByText("Submit"));
    });
    expect(screen.getByText("incorrect code")).toBeInTheDocument();
    expect(
      screen.queryByText(
        "To start using SimpleReport, visit the website to log in to your account."
      )
    ).not.toBeInTheDocument();
  });

  it("requires a security code to be entered", () => {
    fireEvent.click(screen.getByText("Submit"));
    expect(screen.getByText("Enter your security code")).toBeInTheDocument();
    expect(
      screen.queryByText(
        "To start using SimpleReport, visit the website to log in to your account."
      )
    ).not.toBeInTheDocument();
  });
});
