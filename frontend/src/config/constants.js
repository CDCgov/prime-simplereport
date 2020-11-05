export const ROOT_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:4000"
    : "https://prime-data-input-api.app.cloud.gov";

export const PATIENT_TERM = "person";
export const PATIENT_TERM_CAP = "Person";
export const PATIENT_TERM_PLURAL = "people";
export const PATIENT_TERM_PLURAL_CAP = "People";
