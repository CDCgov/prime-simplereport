/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetFacilities
// ====================================================

export interface GetFacilities_organization_testingFacility_defaultDeviceType {
  __typename: "DeviceType";
  internalId: string | null;
}

export interface GetFacilities_organization_testingFacility_deviceTypes {
  __typename: "DeviceType";
  internalId: string | null;
}

export interface GetFacilities_organization_testingFacility_orderingProvider {
  __typename: "Provider";
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  suffix: string | null;
  NPI: string | null;
  street: string | null;
  streetTwo: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  phone: string | null;
}

export interface GetFacilities_organization_testingFacility {
  __typename: "Facility";
  id: string | null;
  cliaNumber: string | null;
  name: string | null;
  street: string | null;
  streetTwo: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  phone: string | null;
  email: string | null;
  defaultDeviceType: GetFacilities_organization_testingFacility_defaultDeviceType | null;
  deviceTypes:
    | (GetFacilities_organization_testingFacility_deviceTypes | null)[]
    | null;
  orderingProvider: GetFacilities_organization_testingFacility_orderingProvider | null;
}

export interface GetFacilities_organization {
  __typename: "Organization";
  internalId: string | null;
  testingFacility: (GetFacilities_organization_testingFacility | null)[] | null;
}

export interface GetFacilities_deviceType {
  __typename: "DeviceType";
  internalId: string | null;
  name: string | null;
}

export interface GetFacilities {
  organization: GetFacilities_organization | null;
  deviceType: (GetFacilities_deviceType | null)[] | null;
}
