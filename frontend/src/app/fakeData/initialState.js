import { initialPatientState } from "./patients";
import { initialDevicesState } from "./devices";
// This doesn't work yet
//import { initialPatientState, initialDevicesState } from "./get-from-graphsql";

import { initialTestResultsState } from "./testResults";
import { initialOrganizationState } from "./orgs";
// import { initialUserState } from "./users";
import { initialTestQueueState } from "./testQueue";

export const initialState = {
  patients: initialPatientState,
  testResults: initialTestResultsState,
  testQueue: initialTestQueueState,
  organization: initialOrganizationState,
  devices: initialDevicesState,
  // user: initialUserState,
};
