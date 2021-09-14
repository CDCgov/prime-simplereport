/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetManagedFacilities
// ====================================================

export interface GetManagedFacilities_organization_testingFacility_defaultDeviceType {
  __typename: "DeviceType";
  internalId: string | null;
}

export interface GetManagedFacilities_organization_testingFacility_deviceTypes {
  __typename: "DeviceType";
  internalId: string | null;
}

export interface GetManagedFacilities_organization_testingFacility_orderingProvider {
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

export interface GetManagedFacilities_organization_testingFacility {
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
  defaultDeviceType: GetManagedFacilities_organization_testingFacility_defaultDeviceType | null;
  deviceTypes:
    | (GetManagedFacilities_organization_testingFacility_deviceTypes | null)[]
    | null;
  orderingProvider: GetManagedFacilities_organization_testingFacility_orderingProvider | null;
}

export interface GetManagedFacilities_organization {
  __typename: "Organization";
  testingFacility:
    | (GetManagedFacilities_organization_testingFacility | null)[]
    | null;
}

export interface GetManagedFacilities {
  organization: GetManagedFacilities_organization | null;
}
