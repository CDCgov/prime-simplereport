import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

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
  beforeEach(async () => {
    render(<MfaSelect />);
  });

  it("can choose an mfa option", async () => {
    const smsRadio = screen.getByLabelText("Text message (SMS)", {
      exact: false,
    });
    await act(async () => await userEvent.click(smsRadio));
    expect(smsRadio).toBeChecked();
  });

  it("requires an mfa option", async () => {
    await act(async () => await userEvent.click(screen.getByText("Continue")));
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
      <MemoryRouter basename="/uac" initialEntries={["/uac/mfa-select"]}>
        <Routes>
          <Route path="mfa-select" element={<MfaSelect />} />
          <Route path="mfa-sms" element={<MfaSms />} />
          <Route path="mfa-okta" element={<MfaOkta />} />
          <Route path="mfa-google-auth" element={<MfaGoogleAuth />} />
          <Route path="mfa-security-key" element={<MfaSecurityKey />} />
          <Route path="mfa-phone" element={<MfaPhone />} />
          <Route path="mfa-email/verify" element={<MfaEmailVerify />} />
        </Routes>
      </MemoryRouter>
    );

    continueButton = screen.getByText("Continue");
  });

  it("can route to the SMS page", async () => {
    const smsRadio = screen.getByLabelText("Text message (SMS)", {
      exact: false,
    });
    await act(async () => await userEvent.click(smsRadio));
    expect(smsRadio).toBeChecked();
    await act(async () => await userEvent.click(continueButton));
    await waitFor(() => {
      expect(
        screen.getByText("Get your security code via text message (SMS).")
      ).toBeInTheDocument();
    });
  });

  it("can route to the Google Auth page", async () => {
    const googleRadio = screen.getByLabelText("Google Authenticator", {
      exact: false,
    });
    await act(async () => await userEvent.click(googleRadio));
    expect(googleRadio).toBeChecked();
    await act(async () => await userEvent.click(continueButton));
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
    await act(async () => await userEvent.click(oktaRadio));
    expect(oktaRadio).toBeChecked();
    await act(async () => await userEvent.click(continueButton));
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

    await act(async () => await userEvent.click(securityKeyRadio));
    expect(securityKeyRadio).toBeChecked();
    await act(async () => await userEvent.click(continueButton));

    await waitFor(() => {
      expect(
        screen.getByText(
          "Insert your Security Key in your computer’s USB port or connect it with a USB cable."
        )
      ).toBeInTheDocument();
    });
  });

  it("can route to the Email page", async () => {
    const emailRadio = screen.getByLabelText("Email", {
      exact: false,
    });
    await act(async () => await userEvent.click(emailRadio));
    expect(emailRadio).toBeChecked();
    await act(async () => await userEvent.click(continueButton));
    await waitFor(() => {
      expect(
        screen.getByText(
          "We’ve sent you an email with a one-time security code.",
          { exact: false }
        )
      ).toBeInTheDocument();
    });
  });

  it("can route to the Phone call page", async () => {
    const phoneRadio = screen.getByLabelText("Phone call", {
      exact: false,
    });
    await act(async () => await userEvent.click(phoneRadio));
    expect(phoneRadio).toBeChecked();
    await act(async () => await userEvent.click(continueButton));
    await waitFor(() => {
      expect(
        screen.getByText("Get your security code via a phone call")
      ).toBeInTheDocument();
    });
  });
});
