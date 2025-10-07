import { FetchMock } from "jest-fetch-mock/types";

import { PxpApi, SelfRegistrationData } from "./PxpApiService";

const appInsightsHeaders = {
  "x-ms-session-id": "",
};

const backendUrl = import.meta.env.VITE_BACKEND_URL;

describe("PxpApi", () => {
  beforeEach(() => {
    (fetch as FetchMock).resetMocks();
  });

  describe("validateDateOfBirth", () => {
    beforeEach(async () => {
      (fetch as FetchMock).mockResponseOnce(JSON.stringify({}));
      await PxpApi.validateDateOfBirth(
        "9b831f0b-40f2-4389-87b0-2c90fcd56732",
        "1947-08-21"
      );
    });
    it("calls fetch with the correct data", () => {
      expect(fetch).toHaveBeenCalledWith(`${backendUrl}/pxp/link/verify/v2`, {
        body: '{"patientLinkId":"9b831f0b-40f2-4389-87b0-2c90fcd56732","dateOfBirth":"1947-08-21"}',
        headers: {
          Accept: "application/json, text/plain",
          "Content-Type": "application/json",
          ...appInsightsHeaders,
        },
        method: "POST",
        mode: "cors",
      });
    });
  });

  describe("submitQuestions", () => {
    beforeEach(async () => {
      (fetch as FetchMock).mockResponseOnce(JSON.stringify({}));
      await PxpApi.submitQuestions(
        "9b831f0b-40f2-4389-87b0-2c90fcd56732",
        "1947-08-21",
        {}
      );
    });
    it("calls fetch with the correct data", () => {
      expect(fetch).toHaveBeenCalledWith(`${backendUrl}/pxp/questions`, {
        body: '{"patientLinkId":"9b831f0b-40f2-4389-87b0-2c90fcd56732","dateOfBirth":"1947-08-21","data":{}}',
        headers: {
          Accept: "application/json, text/plain",
          "Content-Type": "application/json",
          ...appInsightsHeaders,
        },
        method: "POST",
        mode: "cors",
      });
    });
  });

  describe("getEntityName", () => {
    beforeEach(async () => {
      (fetch as FetchMock).mockResponseOnce(JSON.stringify({}));
      await PxpApi.getEntityName("9b831f0b-40f2-4389-87b0-2c90fcd56732");
    });
    it("calls fetch with the correct data", () => {
      expect(fetch).toHaveBeenCalledWith(
        `${backendUrl}/pxp/register/entity-name?patientRegistrationLink=9b831f0b-40f2-4389-87b0-2c90fcd56732`,
        {
          method: "GET",
          mode: "cors",
        }
      );
    });
  });

  describe("selfRegister", () => {
    beforeEach(async () => {
      (fetch as FetchMock).mockResponseOnce(JSON.stringify({}));
      await PxpApi.selfRegister({} as SelfRegistrationData);
    });
    it("calls fetch with the correct data", () => {
      expect(fetch).toHaveBeenCalledWith(`${backendUrl}/pxp/register`, {
        body: "{}",
        headers: {
          Accept: "application/json, text/plain",
          "Content-Type": "application/json",
          ...appInsightsHeaders,
        },
        method: "POST",
        mode: "cors",
      });
    });
  });
});
