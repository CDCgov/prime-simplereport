import FetchClient from "../app/utils/api";
import { getAppInsightsHeaders } from "../app/TelemetryService";

const api = new FetchClient();

const getInitOptions = (csvFile: File) => {
  const body = new FormData();
  body.append("file", csvFile);

  return {
    body,
    method: "POST",
    mode: "cors",
    headers: getAppInsightsHeaders(),
  } as RequestInit;
};

export class FileUploadService {
  static uploadPatients(csvFile: File) {
    return fetch(api.getURL("/upload/patients"), getInitOptions(csvFile));
  }

  static uploadResults(csvFile: File) {
    return fetch(api.getURL("/upload/results"), getInitOptions(csvFile));
  }
}
