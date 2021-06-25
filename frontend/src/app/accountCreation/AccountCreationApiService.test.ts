import { FetchMock } from "jest-fetch-mock/types";

import { AccountCreationApi } from "./AccountCreationApiService";

describe("AccountCreationApi", () => {
  beforeEach(() => {
    (fetch as FetchMock).resetMocks();
  });

  describe("setPassword", () => {
    beforeEach(async () => {
      (fetch as FetchMock).mockResponseOnce(JSON.stringify({}));
      await AccountCreationApi.setPassword("DROWSSAP");
    });
    it("calls fetch with the correct data", () => {
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/user-account/set-password",
        {
          body: '{"password":"DROWSSAP"}',
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
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
        "http://localhost:8080/api/user-account/set-recovery-question",
        {
          body: '{"question":"Favorite Cat?","answer":"Savannah cat"}',
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
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
        "http://localhost:8080/api/user-account/enroll-sms-mfa",
        {
          body: '{"userInput":"1-800-273-8255"}',
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
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
        "http://localhost:8080/api/user-account/enroll-voice-call-mfa",
        {
          body: '{"userInput":"867-5309"}',
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
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
        "http://localhost:8080/api/user-account/enroll-email-mfa",
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
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
        "http://localhost:8080/api/user-account/authenticator-qr",
        {
          body: '{"userInput":"Google"}',
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
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
        "http://localhost:8080/api/user-account/enroll-security-key-mfa",
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
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
        "http://localhost:8080/api/user-account/activate-security-key-mfa",
        {
          body: '{"attestation":"ABC","clientData":"123"}',
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
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
        "http://localhost:8080/api/user-account/verify-activation-passcode",
        {
          body: '{"userInput":"789345"}',
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
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
        "http://localhost:8080/api/user-account/resend-activation-passcode",
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          method: "POST",
        }
      );
    });
  });
});
