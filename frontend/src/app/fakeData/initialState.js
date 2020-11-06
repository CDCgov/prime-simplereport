import { initialPatientState } from "./patients";
import { initialTestResultsState } from "./testResults";
import { initialOrganizationState } from "./orgs";
import { initialDevicesState } from "./devices";
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
