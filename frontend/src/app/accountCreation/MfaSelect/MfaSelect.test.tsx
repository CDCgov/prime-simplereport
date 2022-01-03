import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Switch } from "react-router";

import { MfaEmailVerify } from "../MfaEmailVerify/MfaEmailVerify";
import { MfaGoogleAuth } from "../MfaGoogleAuth/MfaGoogleAuth";
import { MfaOkta } from "../MfaOkta/MfaOkta";
import { MfaPhone } from "../MfaPhone/MfaPhone";
import { MfaSecurityKey } from "../MfaSecurityKey/MfaSecurityKey";
import { MfaSms } from "../MfaSms/MfaSms";

import { MfaSelect } from "./MfaSelect";

jest.mock("../AccountCreationApiService", () => ({
  AccountCreationApi: {
    enrollSecurityKeyMfa: () => {
      return new Promise((res) => {
        res({
          activation: { challenge: "some-string", user: { id: "userId" } },
        });
      });
    },
    enrollEmailMfa: () => {},
    enrollTotpMfa: (app: "Google" | "Okta") => {
      return new Promise((res, rej) => {
        if (app === "Google" || app === "Okta") {
          res({ qrcode: "success" });
        } else {
          rej();
        }
      });
    },
  },
}));

describe("MfaSelect", () => {
  beforeEach(() => {
    render(<MfaSelect />);
  });

  it("can choose an mfa option", () => {
    const smsRadio = screen.getByLabelText("Text message (SMS)", {
      exact: false,
    });
    userEvent.click(smsRadio);
    expect(smsRadio).toBeChecked();
  });

  it("requires an mfa option", () => {
    userEvent.click(screen.getByText("Continue"));
    expect(
      screen.getByText("Select an authentication option")
    ).toBeInTheDocument();
  });
});

function create(_obj: any) {
  return new Promise((cred) => {
    cred({
      response: {
        attestationObject: "attestation",
        clientDataJSON: "clientDataJSON",
      },
    });
  });
}

describe("MfaSelect routing", () => {
  let continueButton: HTMLElement;
  beforeEach(() => {
    let credContainer = { create: create };
    Object.defineProperty(window.navigator, "credentials", {
      value: credContainer,
      configurable: true,
    });

    render(
      <MemoryRouter initialEntries={["/mfa-select"]}>
        <Switch>
          <Route path="/mfa-select" component={MfaSelect} />
          <Route path="/mfa-sms" component={MfaSms} />
          <Route path="/mfa-okta" component={MfaOkta} />
          <Route path="/mfa-google-auth" component={MfaGoogleAuth} />
          <Route path="/mfa-security-key" component={MfaSecurityKey} />
          <Route path="/mfa-phone" component={MfaPhone} />
          <Route path="/mfa-email/verify" component={MfaEmailVerify} />
        </Switch>
      </MemoryRouter>
    );

    continueButton = screen.getByText("Continue");
  });

  it("can route to the SMS page", () => {
    const smsRadio = screen.getByLabelText("Text message (SMS)", {
      exact: false,
    });
    userEvent.click(smsRadio);
    expect(smsRadio).toBeChecked();
    userEvent.click(continueButton);
    expect(
      screen.getByText("Get your security code via text message (SMS).")
    ).toBeInTheDocument();
  });

  it("can route to the Google Auth page", async () => {
    const googleRadio = screen.getByLabelText("Google Authenticator", {
      exact: false,
    });
    userEvent.click(googleRadio);
    expect(googleRadio).toBeChecked();
    userEvent.click(continueButton);
    expect(
      await screen.findByText(
        "Get your security code via the Google Authenticator application."
      )
    ).toBeInTheDocument();
  });

  it("can route to the Okta Verify page", async () => {
    const oktaRadio = screen.getByLabelText("Okta Verify", {
      exact: false,
    });
    userEvent.click(oktaRadio);
    expect(oktaRadio).toBeChecked();
    userEvent.click(continueButton);
    expect(
      await screen.findByText(
        "Get your security code via the Okta Verify application."
      )
    ).toBeInTheDocument();
  });

  it("can route to the Security Key page", async () => {
    const securityKeyRadio = screen.getByLabelText(
      "Security key or biometric authentication",
      {
        exact: false,
      }
    );

    userEvent.click(securityKeyRadio);
    expect(securityKeyRadio).toBeChecked();
    userEvent.click(continueButton);

    expect(
      screen.getByText(
        "Insert your Security Key in your computer’s USB port or connect it with a USB cable."
      )
    ).toBeInTheDocument();
  });

  it("can route to the Email page", () => {
    const emailRadio = screen.getByLabelText("Email", {
      exact: false,
    });
    userEvent.click(emailRadio);
    expect(emailRadio).toBeChecked();
    userEvent.click(continueButton);
    expect(
      screen.getByText(
        "We’ve sent you an email with a one-time security code.",
        { exact: false }
      )
    ).toBeInTheDocument();
  });

  it("can route to the Phone call page", () => {
    const phoneRadio = screen.getByLabelText("Phone call", {
      exact: false,
    });
    userEvent.click(phoneRadio);
    expect(phoneRadio).toBeChecked();
    userEvent.click(continueButton);
    expect(
      screen.getByText("Get your security code via a phone call")
    ).toBeInTheDocument();
  });
});
