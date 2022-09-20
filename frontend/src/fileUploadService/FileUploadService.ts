import FetchClient from "../app/utils/api";

const api = new FetchClient(undefined, { mode: "cors" });

export class FileUploadService {
  static uploadPatients(csvFile: File) {
    const body = new FormData();
    body.append("file", csvFile);

    return fetch(api.getURL("/upload/patients"), {
      body,
      method: "POST",
    });
  }

  static uploadResults(csvFile: File) {
    const body = new FormData();
    body.append("file", csvFile);

    return fetch(api.getURL("/upload/results"), {
      body,
      method: "POST",
    });
  }
}
