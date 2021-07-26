import { render, screen, act } from "@testing-library/react";
import { MemoryRouter, Route } from "react-router";

import { MfaComplete } from "../MfaComplete/MfaComplete";

import { MfaSecurityKey } from "./MfaSecurityKey";

jest.mock("../AccountCreationApiService", () => ({
  AccountCreationApi: {
    enrollSecurityKeyMfa: () => {
      return new Promise((res) => {
        res({ activation: { challenge: "challenge", user: { id: "userId" } } });
      });
    },
    activateSecurityKeyMfa: (attestation: string, clientData: string) => {
      return new Promise((res, rej) => {
        if (attestation.length !== 0 && clientData.length !== 0) {
          res("success");
        } else {
          rej("utter failure");
        }
      });
    },
  },
}));

jest.mock("../../utils/text", () => ({
  strToBin: (str: string) => {
    return Uint8Array.of(8).fill(2);
  },
  binToStr: (bin: ArrayBuffer) => {
    return "str";
  },
}));

function create(obj: any) {
  return new Promise((cred) => {
    cred({
      response: {
        attestationObject: "attestation",
        clientDataJSON: "clientDataJSON",
      },
    });
  });
}

describe("MFA Security Key Successful", () => {
  beforeEach(() => {
    let credContainer = { create: create };
    Object.defineProperty(window.navigator, "credentials", {
      value: credContainer,
      configurable: true,
    });
  });

  it("displays the success page if security key is activated", async () => {
    // in the real flow, a user has to touch their security key to trigger the enrollment.
    // it's not possible to mock that, so instead we mock out functions as if the user
    // had touched their key and assert that they get to the success page.
    act(() => {
      render(
        <MemoryRouter initialEntries={["/enroll-security-key-mfa"]}>
          <Route path="/enroll-security-key-mfa" component={MfaSecurityKey} />
          <Route path="/success" component={MfaComplete} />
        </MemoryRouter>
      );
    });

    expect(
      await screen.findByText("Account set up complete")
    ).toBeInTheDocument();
  });
});
