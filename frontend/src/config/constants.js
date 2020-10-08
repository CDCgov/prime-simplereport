export const ROOT_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8000/v1"
    : "https://prime-data-input-api.app.cloud.gov";
