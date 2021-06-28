import { render, screen, fireEvent } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { MemoryRouter, Route, Switch } from "react-router";

import { MfaComplete } from "../MfaComplete/MfaComplete";

import { MfaGoogleAuthVerify } from "./MfaGoogleAuthVerify";

jest.mock("../AccountCreationApiService", () => ({
  AccountCreationApi: {
    verifyActivationPasscode: (code: string) => {
      return new Promise((res, rej) => {
        if (code === "123456") {
          res("success");
        } else {
          rej({ message: "incorrect code" });
        }
      });
    },
  },
}));

describe("Verify Google Auth MFA", () => {
  beforeEach(() => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/mfa-google-auth/verify",
          },
        ]}
      >
        <Switch>
          <Route
            path="/mfa-google-auth/verify"
            component={MfaGoogleAuthVerify}
          />
          <Route path="/success" component={MfaComplete} />
        </Switch>
      </MemoryRouter>
    );
  });

  it("can submit a valid security code", async () => {
    expect(
      screen.getByText("Enter a code from the Google Authenticator app.", {
        exact: false,
      })
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
      screen.getByText("To start using SimpleReport, log in to your account.")
    ).toBeInTheDocument();
  });

  it("shows an error for an invalid security code", async () => {
    expect(
      screen.getByText("Enter a code from the Google Authenticator app.", {
        exact: false,
      })
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
      screen.queryByText("To start using SimpleReport, log in to your account.")
    ).not.toBeInTheDocument();
  });

  it("requires a security code to be entered", () => {
    fireEvent.click(screen.getByText("Submit"));
    expect(screen.getByText("Enter your security code")).toBeInTheDocument();
    expect(
      screen.queryByText("To start using SimpleReport, log in to your account.")
    ).not.toBeInTheDocument();
  });
});
