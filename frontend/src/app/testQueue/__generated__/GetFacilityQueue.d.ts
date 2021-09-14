/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {
  TestResultDeliveryPreference,
  PhoneType,
} from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: GetFacilityQueue
// ====================================================

export interface GetFacilityQueue_queue_deviceType {
  __typename: "DeviceType";
  internalId: string | null;
  name: string | null;
  model: string | null;
  testLength: number | null;
}

export interface GetFacilityQueue_queue_patient_phoneNumbers {
  __typename: "PhoneNumber";
  type: PhoneType | null;
  number: string | null;
}

export interface GetFacilityQueue_queue_patient {
  __typename: "Patient";
  internalId: string | null;
  telephone: string | null;
  birthDate: any | null;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  gender: string | null;
  testResultDelivery: TestResultDeliveryPreference | null;
  preferredLanguage: string | null;
  phoneNumbers: (GetFacilityQueue_queue_patient_phoneNumbers | null)[] | null;
}

export interface GetFacilityQueue_queue {
  __typename: "TestOrder";
  internalId: string | null;
  pregnancy: string | null;
  dateAdded: string | null;
  symptoms: string | null;
  symptomOnset: any | null;
  noSymptoms: boolean | null;
  firstTest: boolean | null;
  priorTestDate: any | null;
  priorTestType: string | null;
  priorTestResult: string | null;
  deviceType: GetFacilityQueue_queue_deviceType | null;
  patient: GetFacilityQueue_queue_patient | null;
  result: string | null;
  dateTested: any | null;
}

export interface GetFacilityQueue_organization_testingFacility_deviceTypes {
  __typename: "DeviceType";
  internalId: string | null;
  name: string | null;
  model: string | null;
  testLength: number | null;
}

export interface GetFacilityQueue_organization_testingFacility_defaultDeviceType {
  __typename: "DeviceType";
  internalId: string | null;
  name: string | null;
  model: string | null;
  testLength: number | null;
}

export interface GetFacilityQueue_organization_testingFacility {
  __typename: "Facility";
  id: string | null;
  deviceTypes:
    | (GetFacilityQueue_organization_testingFacility_deviceTypes | null)[]
    | null;
  defaultDeviceType: GetFacilityQueue_organization_testingFacility_defaultDeviceType | null;
}

export interface GetFacilityQueue_organization {
  __typename: "Organization";
  testingFacility:
    | (GetFacilityQueue_organization_testingFacility | null)[]
    | null;
}

export interface GetFacilityQueue {
  queue: (GetFacilityQueue_queue | null)[] | null;
  organization: GetFacilityQueue_organization | null;
}

export interface GetFacilityQueueVariables {
  facilityId: string;
}
