/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {
  PhoneType,
  TestResultDeliveryPreference,
} from "./../../../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: GetPatientsByFacilityForQueue
// ====================================================

export interface GetPatientsByFacilityForQueue_patients_phoneNumbers {
  __typename: "PhoneNumber";
  type: PhoneType | null;
  number: string | null;
}

export interface GetPatientsByFacilityForQueue_patients {
  __typename: "Patient";
  internalId: string | null;
  firstName: string | null;
  lastName: string | null;
  middleName: string | null;
  birthDate: any | null;
  gender: string | null;
  telephone: string | null;
  phoneNumbers:
    | (GetPatientsByFacilityForQueue_patients_phoneNumbers | null)[]
    | null;
  testResultDelivery: TestResultDeliveryPreference | null;
}

export interface GetPatientsByFacilityForQueue {
  patients: (GetPatientsByFacilityForQueue_patients | null)[] | null;
}

export interface GetPatientsByFacilityForQueueVariables {
  facilityId: string;
  namePrefixMatch?: string | null;
}
