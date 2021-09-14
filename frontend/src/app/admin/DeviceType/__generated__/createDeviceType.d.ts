/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: createDeviceType
// ====================================================

export interface createDeviceType_createDeviceType {
  __typename: "DeviceType";
  internalId: string | null;
}

export interface createDeviceType {
  createDeviceType: createDeviceType_createDeviceType | null;
}

export interface createDeviceTypeVariables {
  name: string;
  manufacturer: string;
  model: string;
  loincCode: string;
  swabType: string;
}
