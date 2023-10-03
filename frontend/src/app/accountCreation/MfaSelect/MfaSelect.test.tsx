import { render, screen, waitFor } from "@testing-library/react";
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
  const renderWithUser = () => ({
    user: userEvent.setup(),
    ...render(<MfaSelect />),
  });

  it("can choose an mfa option", async () => {
    const { user } = renderWithUser();
    const smsRadio = screen.getByLabelText("Text message (SMS)", {
      exact: false,
    });
    await user.click(smsRadio);
    expect(smsRadio).toBeChecked();
  });

  it("requires an mfa option", async () => {
    const { user } = renderWithUser();
    await user.click(screen.getByText("Continue"));
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
  const renderAndContinue = () => {
    const { ...renderControls } = render(
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

    return { user: userEvent.setup(), ...renderControls };
  };

  beforeEach(() => {
    let credContainer = { create: create };
    Object.defineProperty(window.navigator, "credentials", {
      value: credContainer,
      configurable: true,
    });
  });

  it("can route to the SMS page", async () => {
    const { user } = renderAndContinue();
    const smsRadio = screen.getByLabelText("Text message (SMS)", {
      exact: false,
    });
    await user.click(smsRadio);
    expect(smsRadio).toBeChecked();
    await user.click(continueButton);
    await waitFor(() => {
      expect(
        screen.getByText("Get your security code via text message (SMS).")
      ).toBeInTheDocument();
    });
  });

  it("can route to the Google Auth page", async () => {
    const { user } = renderAndContinue();
    const googleRadio = screen.getByLabelText("Google Authenticator", {
      exact: false,
    });
    await user.click(googleRadio);
    expect(googleRadio).toBeChecked();
    await user.click(continueButton);
    expect(
      await screen.findByText(
        "Get your security code via the Google Authenticator application."
      )
    ).toBeInTheDocument();
  });

  it("can route to the Okta Verify page", async () => {
    const { user } = renderAndContinue();
    const oktaRadio = screen.getByLabelText("Okta Verify", {
      exact: false,
    });
    await user.click(oktaRadio);
    expect(oktaRadio).toBeChecked();
    await user.click(continueButton);
    expect(
      await screen.findByText(
        "Get your security code via the Okta Verify application."
      )
    ).toBeInTheDocument();
  });

  it("can route to the Security Key page", async () => {
    const { user } = renderAndContinue();
    const securityKeyRadio = screen.getByLabelText(
      "Security key or biometric authentication",
      {
        exact: false,
      }
    );

    await user.click(securityKeyRadio);
    expect(securityKeyRadio).toBeChecked();
    await user.click(continueButton);

    await waitFor(() => {
      expect(
        screen.getByText("How to register your security key.")
      ).toBeInTheDocument();
    });
  });

  it("can route to the Email page", async () => {
    const { user } = renderAndContinue();
    const emailRadio = screen.getByLabelText("Email", {
      exact: false,
    });
    await user.click(emailRadio);
    expect(emailRadio).toBeChecked();
    await user.click(continueButton);
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
    const { user } = renderAndContinue();
    const phoneRadio = screen.getByLabelText("Phone call", {
      exact: false,
    });
    await user.click(phoneRadio);
    expect(phoneRadio).toBeChecked();
    await user.click(continueButton);
    await waitFor(() => {
      expect(
        screen.getByText("Get your security code via a phone call")
      ).toBeInTheDocument();
    });
  });
});
