/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {
  PhoneType,
  TestResultDeliveryPreference,
} from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: GetPatientDetails
// ====================================================

export interface GetPatientDetails_patient_phoneNumbers {
  __typename: "PhoneNumber";
  type: PhoneType | null;
  number: string | null;
}

export interface GetPatientDetails_patient_facility {
  __typename: "Facility";
  id: string | null;
}

export interface GetPatientDetails_patient {
  __typename: "Patient";
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  birthDate: any | null;
  street: string | null;
  streetTwo: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  telephone: string | null;
  phoneNumbers: (GetPatientDetails_patient_phoneNumbers | null)[] | null;
  role: string | null;
  lookupId: string | null;
  email: string | null;
  county: string | null;
  race: string | null;
  ethnicity: string | null;
  tribalAffiliation: (string | null)[] | null;
  gender: string | null;
  residentCongregateSetting: boolean | null;
  employedInHealthcare: boolean | null;
  preferredLanguage: string | null;
  facility: GetPatientDetails_patient_facility | null;
  testResultDelivery: TestResultDeliveryPreference | null;
}

export interface GetPatientDetails {
  patient: GetPatientDetails_patient | null;
}

export interface GetPatientDetailsVariables {
  id: string;
}
