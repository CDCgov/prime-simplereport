/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {
  PhoneNumberInput,
  TestResultDeliveryPreference,
} from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: UpdatePatient
// ====================================================

export interface UpdatePatient_updatePatient {
  __typename: "Patient";
  internalId: string | null;
}

export interface UpdatePatient {
  updatePatient: UpdatePatient_updatePatient | null;
}

export interface UpdatePatientVariables {
  facilityId?: string | null;
  patientId: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  birthDate: any;
  street: string;
  streetTwo?: string | null;
  city?: string | null;
  state: string;
  zipCode: string;
  telephone?: string | null;
  phoneNumbers?: PhoneNumberInput[] | null;
  role?: string | null;
  lookupId?: string | null;
  email?: string | null;
  county?: string | null;
  race?: string | null;
  ethnicity?: string | null;
  tribalAffiliation?: string | null;
  gender?: string | null;
  residentCongregateSetting?: boolean | null;
  employedInHealthcare?: boolean | null;
  preferredLanguage?: string | null;
  testResultDelivery?: TestResultDeliveryPreference | null;
}
