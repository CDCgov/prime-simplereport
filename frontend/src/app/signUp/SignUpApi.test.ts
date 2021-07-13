import { FetchMock } from "jest-fetch-mock/types";

import { SignUpApi } from "./SignUpApi";

describe("SignUpApi", () => {
  beforeEach(() => {
    (fetch as FetchMock).resetMocks();
  });

  describe("setPassword", () => {
    beforeEach(async () => {
      (fetch as FetchMock).mockResponseOnce(JSON.stringify({}));
      await SignUpApi.getQuestions();
    });
    it("calls fetch with the correct data", () => {
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8080/identity-verification/get-questions",
        {
          body: "{}",
          headers: {
            Accept: "application/json, text/plain",
            "Content-Type": "application/json",
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
        outWalletAnswer3: "5",
        outWalletAnswer1: "2",
        outWalletAnswer2: "3",
      });
    });
    it("calls fetch with the correct data", () => {
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8080/identity-verification/submit-answers",
        {
          body: '{"answers":["2","3","5"]}',
          headers: {
            Accept: "application/json, text/plain",
            "Content-Type": "application/json",
          },
          method: "POST",
        }
      );
    });
  });
});
