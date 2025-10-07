import { FetchMock } from "jest-fetch-mock/types";

import { AccountCreationApi } from "./AccountCreationApiService";

const appInsightsHeaders = {
  "x-ms-session-id": "",
};

const backendUrl = import.meta.env.VITE_BACKEND_URL;

describe("AccountCreationApi", () => {
  beforeEach(() => {
    (fetch as FetchMock).resetMocks();
  });

  describe("getUserStatus", () => {
    beforeEach(async () => {
      (fetch as FetchMock).mockResponseOnce(JSON.stringify({}));
      await AccountCreationApi.getUserStatus("testActivationToken");
    });
    it("calls getUserStatus with the correct data", () => {
      expect(fetch).toHaveBeenCalledWith(
        `${backendUrl}/user-account/user-status?activationToken=testActivationToken`,
        {
          body: undefined,
          headers: {
            Accept: "application/json, text/plain",
            "Content-Type": "application/json",
            ...appInsightsHeaders,
          },
          method: "GET",
        }
      );
    });
  });

  describe("initialize", () => {
    beforeEach(async () => {
      (fetch as FetchMock).mockResponseOnce(JSON.stringify({}));
      await AccountCreationApi.initialize("testActivationToken");
    });
    it("calls initialize with the correct data", () => {
      expect(fetch).toHaveBeenCalledWith(
        `${backendUrl}/user-account/initialize`,
        {
          body: '{"activationToken":"testActivationToken"}',
          headers: {
            Accept: "application/json, text/plain",
            "Content-Type": "application/json",
            ...appInsightsHeaders,
          },
          method: "POST",
        }
      );
    });
  });

  describe("setPassword", () => {
    beforeEach(async () => {
      (fetch as FetchMock).mockResponseOnce(JSON.stringify({}));
      await AccountCreationApi.setPassword("DROWSSAP");
    });
    it("calls fetch with the correct data", () => {
      expect(fetch).toHaveBeenCalledWith(
        `${backendUrl}/user-account/set-password`,
        {
          body: '{"password":"DROWSSAP"}',
          headers: {
            Accept: "application/json, text/plain",
            "Content-Type": "application/json",
            ...appInsightsHeaders,
          },
          method: "POST",
        }
      );
    });
  });
  describe("setRecoveryQuestion", () => {
    beforeEach(async () => {
      (fetch as FetchMock).mockResponseOnce(JSON.stringify({}));
      await AccountCreationApi.setRecoveryQuestion(
        "Favorite Cat?",
        "Savannah cat"
      );
    });
    it("calls fetch with the correct data", () => {
      expect(fetch).toHaveBeenCalledWith(
        `${backendUrl}/user-account/set-recovery-question`,
        {
          body: '{"question":"Favorite Cat?","answer":"Savannah cat"}',
          headers: {
            Accept: "application/json, text/plain",
            "Content-Type": "application/json",
            ...appInsightsHeaders,
          },
          method: "POST",
        }
      );
    });
  });
  describe("enrollSmsMfa", () => {
    beforeEach(async () => {
      (fetch as FetchMock).mockResponseOnce(JSON.stringify({}));
      await AccountCreationApi.enrollSmsMfa("1-800-273-8255");
    });
    it("calls fetch with the correct data", () => {
      expect(fetch).toHaveBeenCalledWith(
        `${backendUrl}/user-account/enroll-sms-mfa`,
        {
          body: '{"userInput":"1-800-273-8255"}',
          headers: {
            Accept: "application/json, text/plain",
            "Content-Type": "application/json",
            ...appInsightsHeaders,
          },
          method: "POST",
        }
      );
    });
  });
  describe("enrollVoiceCallMfa", () => {
    beforeEach(async () => {
      (fetch as FetchMock).mockResponseOnce(JSON.stringify({}));
      await AccountCreationApi.enrollVoiceCallMfa("867-5309");
    });
    it("calls fetch with the correct data", () => {
      expect(fetch).toHaveBeenCalledWith(
        `${backendUrl}/user-account/enroll-voice-call-mfa`,
        {
          body: '{"userInput":"867-5309"}',
          headers: {
            Accept: "application/json, text/plain",
            "Content-Type": "application/json",
            ...appInsightsHeaders,
          },
          method: "POST",
        }
      );
    });
  });
  describe("enrollEmailMfa", () => {
    beforeEach(async () => {
      (fetch as FetchMock).mockResponseOnce(JSON.stringify({}));
      await AccountCreationApi.enrollEmailMfa();
    });
    it("calls fetch with the correct data", () => {
      expect(fetch).toHaveBeenCalledWith(
        `${backendUrl}/user-account/enroll-email-mfa`,
        {
          headers: {
            Accept: "application/json, text/plain",
            "Content-Type": "application/json",
            ...appInsightsHeaders,
          },
          method: "POST",
        }
      );
    });
  });
  describe("enrollTotpMfa", () => {
    beforeEach(async () => {
      (fetch as FetchMock).mockResponseOnce(JSON.stringify({}));
      await AccountCreationApi.enrollTotpMfa("Google");
    });
    it("calls fetch with the correct data", () => {
      expect(fetch).toHaveBeenCalledWith(
        `${backendUrl}/user-account/authenticator-qr`,
        {
          body: '{"userInput":"Google"}',
          headers: {
            Accept: "application/json, text/plain",
            "Content-Type": "application/json",
            ...appInsightsHeaders,
          },
          method: "POST",
        }
      );
    });
  });
  describe("enrollSecurityKeyMfa", () => {
    beforeEach(async () => {
      (fetch as FetchMock).mockResponseOnce(JSON.stringify({}));
      await AccountCreationApi.enrollSecurityKeyMfa();
    });
    it("calls fetch with the correct data", () => {
      expect(fetch).toHaveBeenCalledWith(
        `${backendUrl}/user-account/enroll-security-key-mfa`,
        {
          headers: {
            Accept: "application/json, text/plain",
            "Content-Type": "application/json",
            ...appInsightsHeaders,
          },
          method: "POST",
        }
      );
    });
  });
  describe("activateSecurityKeyMfa", () => {
    beforeEach(async () => {
      (fetch as FetchMock).mockResponseOnce(JSON.stringify({}));
      await AccountCreationApi.activateSecurityKeyMfa("ABC", "123");
    });
    it("calls fetch with the correct data", () => {
      expect(fetch).toHaveBeenCalledWith(
        `${backendUrl}/user-account/activate-security-key-mfa`,
        {
          body: '{"attestation":"ABC","clientData":"123"}',
          headers: {
            Accept: "application/json, text/plain",
            "Content-Type": "application/json",
            ...appInsightsHeaders,
          },
          method: "POST",
        }
      );
    });
  });
  describe("verifyActivationPasscode", () => {
    beforeEach(async () => {
      (fetch as FetchMock).mockResponseOnce(JSON.stringify({}));
      await AccountCreationApi.verifyActivationPasscode("789345");
    });
    it("calls fetch with the correct data", () => {
      expect(fetch).toHaveBeenCalledWith(
        `${backendUrl}/user-account/verify-activation-passcode`,
        {
          body: '{"userInput":"789345"}',
          headers: {
            Accept: "application/json, text/plain",
            "Content-Type": "application/json",
            ...appInsightsHeaders,
          },
          method: "POST",
        }
      );
    });
  });
  describe("resendActivationPasscode", () => {
    beforeEach(async () => {
      (fetch as FetchMock).mockResponseOnce(JSON.stringify({}));
      await AccountCreationApi.resendActivationPasscode();
    });
    it("calls fetch with the correct data", () => {
      expect(fetch).toHaveBeenCalledWith(
        `${backendUrl}/user-account/resend-activation-passcode`,
        {
          headers: {
            Accept: "application/json, text/plain",
            "Content-Type": "application/json",
            ...appInsightsHeaders,
          },
          method: "POST",
        }
      );
    });
  });
});
