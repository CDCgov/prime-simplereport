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
  });

  describe("uploading patients", () => {
    const csvFile = new File(["foo"], "patients.csv");

    it("calls fetch with the correct data", async () => {
      // GIVEN
      const expectedBody = new FormData();
      expectedBody.append("file", csvFile);

      // WHEN
      await FileUploadService.uploadPatients(csvFile);

      // THEN
      expect(fetch).toHaveBeenCalledWith(`${backendUrl}/upload/patients`, {
        body: expectedBody,
        headers: { ...appInsightsHeaders },
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
        headers: { ...appInsightsHeaders },
        method: "POST",
        mode: "cors",
      });
    });
  });
});
