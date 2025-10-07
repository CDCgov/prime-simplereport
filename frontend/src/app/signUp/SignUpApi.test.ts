import { FetchMock } from "jest-fetch-mock/types";

import { SignUpApi } from "./SignUpApi";

const appInsightsHeaders = {
  "x-ms-session-id": "",
};

const backendUrl = process.env.VITE_BACKEND_URL;

describe("SignUpApi", () => {
  beforeEach(() => {
    (fetch as FetchMock).resetMocks();
  });

  describe("setPassword", () => {
    beforeEach(async () => {
      (fetch as FetchMock).mockResponseOnce(JSON.stringify({}));
      await SignUpApi.getQuestions({
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: "08/30/1983",
        email: "john.doe@test.com",
        phoneNumber: "0123456789",
        streetAddress1: "Test Street",
        city: "Test City",
        state: "CA",
        zip: "TEST POSTCODE",
        orgExternalId: "1123-12213",
      });
    });
    it("calls fetch with the correct data", () => {
      expect(fetch).toHaveBeenCalledWith(
        `${backendUrl}/identity-verification/get-questions`,
        {
          body: '{"firstName":"John","lastName":"Doe","dateOfBirth":"08/30/1983","email":"john.doe@test.com","phoneNumber":"0123456789","streetAddress1":"Test Street","city":"Test City","state":"CA","zip":"TEST POSTCODE","orgExternalId":"1123-12213"}',
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

  describe("submitAnswers", () => {
    beforeEach(async () => {
      (fetch as FetchMock).mockResponseOnce(JSON.stringify({}));
      await SignUpApi.submitAnswers({
        sessionId: "foo",
        orgExternalId: "bar",
        answers: [2, 3, 5],
      });
    });
    it("calls fetch with the correct data", () => {
      expect(fetch).toHaveBeenCalledWith(
        `${backendUrl}/identity-verification/submit-answers`,
        {
          body: '{"sessionId":"foo","orgExternalId":"bar","answers":[2,3,5]}',
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

  describe("createOrganization", () => {
    beforeEach(async () => {
      (fetch as FetchMock).mockResponseOnce(JSON.stringify({}));
      await SignUpApi.createOrganization({
        firstName: "Laslo",
        lastName: "Dickens",
        email: "laslo@shadow.corp",
        name: "Shadow",
        type: "treatment_center",
        state: "NY",
        workPhoneNumber: "665-452-5484",
      });
    });
    it("calls fetch with the correct data", () => {
      expect(fetch).toHaveBeenCalledWith(
        `${backendUrl}/account-request/organization-add-to-queue`,
        {
          body: '{"firstName":"Laslo","lastName":"Dickens","email":"laslo@shadow.corp","name":"Shadow","type":"treatment_center","state":"NY","workPhoneNumber":"665-452-5484"}',
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
