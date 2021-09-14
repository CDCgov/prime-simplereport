/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {
  PhoneNumberInput,
  TestResultDeliveryPreference,
} from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: AddPatient
// ====================================================

export interface AddPatient_addPatient_facility {
  __typename: "Facility";
  id: string | null;
}

export interface AddPatient_addPatient {
  __typename: "Patient";
  internalId: string | null;
  facility: AddPatient_addPatient_facility | null;
}

export interface AddPatient {
  addPatient: AddPatient_addPatient | null;
}

export interface AddPatientVariables {
  facilityId?: string | null;
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
