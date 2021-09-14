/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: EditQueueItem
// ====================================================

export interface EditQueueItem_editQueueItem_deviceType {
  __typename: "DeviceType";
  internalId: string | null;
  testLength: number | null;
}

export interface EditQueueItem_editQueueItem {
  __typename: "TestOrder";
  result: string | null;
  dateTested: any | null;
  deviceType: EditQueueItem_editQueueItem_deviceType | null;
}

export interface EditQueueItem {
  editQueueItem: EditQueueItem_editQueueItem | null;
}

export interface EditQueueItemVariables {
  id: string;
  deviceId?: string | null;
  result?: string | null;
  dateTested?: any | null;
}
