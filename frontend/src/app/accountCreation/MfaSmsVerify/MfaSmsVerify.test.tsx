import { render, screen, fireEvent } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { MemoryRouter, Route, Switch } from "react-router";

import { MfaComplete } from "../MfaComplete/MfaComplete";

import { MfaSmsVerify } from "./MfaSmsVerify";

jest.mock("../AccountCreationApiService", () => ({
  AccountCreationApi: {
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

describe("Verify SMS MFA", () => {
  beforeEach(() => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/mfa-sms/verify",
            state: { contact: "530-867-5309" },
          },
        ]}
      >
        <Switch>
          <Route path="/mfa-sms/verify" component={MfaSmsVerify} />
          <Route path="/success" component={MfaComplete} />
        </Switch>
      </MemoryRouter>
    );
  });

  it("can submit a valid security code", async () => {
    expect(
      screen.getByText("530-867-5309", { exact: false })
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
      screen.getByText("530-867-5309", { exact: false })
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
