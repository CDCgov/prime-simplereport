/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: AddFacility
// ====================================================

export interface AddFacility {
  addFacility: string | null;
}

export interface AddFacilityVariables {
  testingFacilityName: string;
  cliaNumber?: string | null;
  street: string;
  streetTwo?: string | null;
  city?: string | null;
  state: string;
  zipCode: string;
  phone?: string | null;
  email?: string | null;
  orderingProviderFirstName?: string | null;
  orderingProviderMiddleName?: string | null;
  orderingProviderLastName?: string | null;
  orderingProviderSuffix?: string | null;
  orderingProviderNPI?: string | null;
  orderingProviderStreet?: string | null;
  orderingProviderStreetTwo?: string | null;
  orderingProviderCity?: string | null;
  orderingProviderState?: string | null;
  orderingProviderZipCode?: string | null;
  orderingProviderPhone?: string | null;
  devices: (string | null)[];
  defaultDevice: string;
}
