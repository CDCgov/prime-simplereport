import FetchClient from "../app/utils/api";
import { getAppInsightsHeaders } from "../app/TelemetryService";

const api = new FetchClient();

const initPatientUploadRequest = (csvFile: File, facilityId: string) => {
  const body = new FormData();
  body.append("file", csvFile);
  body.append("rawFacilityId", facilityId);

  return {
    body,
    method: "POST",
    mode: "cors",
    headers: {
      "Access-Control-Request-Headers": "Authorization",
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      ...getAppInsightsHeaders(),
    },
  } as RequestInit;
};

const getInitOptions = (csvFile: File) => {
  const body = new FormData();
  body.append("file", csvFile);

  return {
    body,
    method: "POST",
    mode: "cors",
    headers: {
      "Access-Control-Request-Headers": "Authorization",
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      ...getAppInsightsHeaders(),
    },
  } as RequestInit;
};

export class FileUploadService {
  static uploadPatients(
    csvFile: File,
    facilityIdFromUrl: string | undefined | null
  ) {
    if (facilityIdFromUrl == null) {
      facilityIdFromUrl = "";
    }
    return fetch(
      api.getURL("/upload/patients"),
      initPatientUploadRequest(csvFile, facilityIdFromUrl)
    );
  }

  static uploadResults(csvFile: File) {
    return fetch(api.getURL("/upload/results"), getInitOptions(csvFile));
  }
}
