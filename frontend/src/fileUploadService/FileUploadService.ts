import FetchClient from "../app/utils/api";
import { getAppInsightsHeaders } from "../app/TelemetryService";

const api = new FetchClient();

const getInitOptions = (csvFile: File, facilityId: string) => {
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

export class FileUploadService {
  static uploadPatients(csvFile: File, facilityId: string | undefined | null) {
    if (facilityId == null) {
      facilityId = "";
    }
    return fetch(
      api.getURL("/upload/patients"),
      getInitOptions(csvFile, facilityId)
    );
  }

  static uploadResults(csvFile: File, facilityId: string | undefined | null) {
    if (facilityId == null) {
      facilityId = "";
    }
    return fetch(
      api.getURL("/upload/results"),
      getInitOptions(csvFile, facilityId)
    );
  }
}
