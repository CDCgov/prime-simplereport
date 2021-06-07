import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Switch } from "react-router";

import { MfaEmail } from "../MfaEmail/MfaEmail";
import { MfaGoogleAuth } from "../MfaGoogleAuth/MfaGoogleAuth";
import { MfaOkta } from "../MfaOkta/MfaOkta";
import { MfaPhone } from "../MfaPhone/MfaPhone";
import { MfaSecurityKey } from "../MfaSecurityKey/MfaSecurityKey";
import { MfaSms } from "../MfaSms/MfaSms";

import { MfaSelect } from "./MfaSelect";

describe("MfaSelect", () => {
  beforeEach(() => {
    render(<MfaSelect />);
  });

  it("can choose an mfa option", () => {
    const smsRadio = screen.getByLabelText("Text message (SMS)", {
      exact: false,
    });
    fireEvent.click(smsRadio);
    expect(smsRadio).toBeChecked();
  });

  it("requires an mfa option", () => {
    fireEvent.click(screen.getByText("Continue"));
    expect(
      screen.getByText("Select an authentication option")
    ).toBeInTheDocument();
  });
});

describe("MfaSelect routing", () => {
  let continueButton: HTMLElement;
  beforeEach(() => {
    render(
      <MemoryRouter initialEntries={["/mfa-select"]}>
        <Switch>
          <Route path="/mfa-select" component={MfaSelect} />
          <Route path="/mfa-sms" component={MfaSms} />
          <Route path="/mfa-okta" component={MfaOkta} />
          <Route path="/mfa-google-auth" component={MfaGoogleAuth} />
          <Route path="/mfa-security-key" component={MfaSecurityKey} />
          <Route path="/mfa-phone" component={MfaPhone} />
          <Route path="/mfa-email" component={MfaEmail} />
        </Switch>
      </MemoryRouter>
    );

    continueButton = screen.getByText("Continue");
  });

  it("can route to the SMS page", () => {
    const smsRadio = screen.getByLabelText("Text message (SMS)", {
      exact: false,
    });
    fireEvent.click(smsRadio);
    expect(smsRadio).toBeChecked();
    fireEvent.click(continueButton);
    expect(
      screen.getByText("Get your security code via text message (SMS).")
    ).toBeInTheDocument();
  });

  it("can route to the Google Auth page", () => {
    const googleRadio = screen.getByLabelText("Google Authenticator", {
      exact: false,
    });
    fireEvent.click(googleRadio);
    expect(googleRadio).toBeChecked();
    fireEvent.click(continueButton);
    expect(
      screen.getByText(
        "Get your security code via the Google Authenticator application."
      )
    ).toBeInTheDocument();
  });

  it("can route to the Okta Verify page", () => {
    const oktaRadio = screen.getByLabelText("Okta Verify", {
      exact: false,
    });
    fireEvent.click(oktaRadio);
    expect(oktaRadio).toBeChecked();
    fireEvent.click(continueButton);
    expect(
      screen.getByText(
        "Get your security code via the Okta Verify application."
      )
    ).toBeInTheDocument();
  });

  it("can route to the Security Key page", () => {
    const securityKeyRadio = screen.getByLabelText(
      "Security key or biometric authentication",
      {
        exact: false,
      }
    );
    fireEvent.click(securityKeyRadio);
    expect(securityKeyRadio).toBeChecked();
    fireEvent.click(continueButton);
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
    fireEvent.click(emailRadio);
    expect(emailRadio).toBeChecked();
    fireEvent.click(continueButton);
    expect(
      screen.getByText("Get your security code via email.")
    ).toBeInTheDocument();
  });

  it("can route to the Phone call page", () => {
    const phoneRadio = screen.getByLabelText("Phone call", {
      exact: false,
    });
    fireEvent.click(phoneRadio);
    expect(phoneRadio).toBeChecked();
    fireEvent.click(continueButton);
    expect(
      screen.getByText("Get your security code via a phone call")
    ).toBeInTheDocument();
  });
});
