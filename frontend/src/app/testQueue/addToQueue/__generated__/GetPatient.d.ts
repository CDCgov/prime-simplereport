/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {
  PhoneType,
  TestResultDeliveryPreference,
} from "./../../../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: GetPatient
// ====================================================

export interface GetPatient_patient_phoneNumbers {
  __typename: "PhoneNumber";
  type: PhoneType | null;
  number: string | null;
}

export interface GetPatient_patient {
  __typename: "Patient";
  internalId: string | null;
  firstName: string | null;
  lastName: string | null;
  middleName: string | null;
  birthDate: any | null;
  gender: string | null;
  telephone: string | null;
  phoneNumbers: (GetPatient_patient_phoneNumbers | null)[] | null;
  testResultDelivery: TestResultDeliveryPreference | null;
}

export interface GetPatient {
  patient: GetPatient_patient | null;
}

export interface GetPatientVariables {
  internalId: string;
}
