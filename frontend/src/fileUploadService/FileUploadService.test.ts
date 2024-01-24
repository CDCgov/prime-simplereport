import { FetchMock } from "jest-fetch-mock/types";

import { FileUploadService } from "./FileUploadService";

const appInsightsHeaders = {
  "x-ms-session-id": "",
};
const backendUrl = process.env.REACT_APP_BACKEND_URL;

describe("FileUploadService", () => {
  beforeEach(() => {
    (fetch as FetchMock).resetMocks();
    (fetch as FetchMock).mockResponseOnce(JSON.stringify({}));
    localStorage.setItem("access_token", "access-token-123");
  });

  describe("uploading patients", () => {
    const csvFile = new File(["foo"], "patients.csv");

    it("calls fetch with the correct data", async () => {
      // GIVEN
      const expectedBody = new FormData();
      expectedBody.append("file", csvFile);
      expectedBody.append("rawFacilityId", "");

      // WHEN
      await FileUploadService.uploadPatients(csvFile, null);

      // THEN
      expect(fetch).toHaveBeenCalledWith(`${backendUrl}/upload/patients`, {
        body: expectedBody,
        headers: {
          "Access-Control-Request-Headers": "Authorization",
          Authorization: "Bearer access-token-123",
          ...appInsightsHeaders,
        },
        method: "POST",
        mode: "cors",
      });
    });
  });

  describe("uploading results", () => {
    const csvFile = new File(["bar"], "results.csv");

    it("calls fetch with the correct data", async () => {
      // GIVEN
      const expectedBody = new FormData();
      expectedBody.append("file", csvFile);

      // WHEN
      await FileUploadService.uploadResults(csvFile);

      // THEN
      expect(fetch).toHaveBeenCalledWith(`${backendUrl}/upload/results`, {
        body: expectedBody,
        headers: {
          "Access-Control-Request-Headers": "Authorization",
          Authorization: "Bearer access-token-123",
          ...appInsightsHeaders,
        },
        method: "POST",
        mode: "cors",
      });
    });
  });
});
