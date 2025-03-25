import { ResultScaleType } from "./LabReportFormUtils";

export type UniversalPatient = {
  name: string;
  email: string;
  phone: string;
  address: string;
  sex: string;
  date_of_birth: string;
  race: string;
  ethnicity: string;
  tribal_affiliation: string;
};

export type UniversalProvider = {
  name: string;
  npi_number: string;
  email: string;
  phone: string;
  address: string;
};

export type UniversalFacility = {
  name: string;
  clia: string;
  phone: string;
  email: string;
  address: string;
};

export type UniversalSpecimen = {
  name: string;
  snomed_type_code: string;
  collection_date: string;
  collection_time: string;
  received_date: string;
  collection_location_name: string;
  collection_location_code: string;
};

export type UniversalTestDetails = {
  condition: string;
  loinc_code: string;
  loinc_short_name: string;
  result_type: ResultScaleType;
  result_value: string;
  result_date: string;
  result_time: string;
  result_interpretation: string;
};
