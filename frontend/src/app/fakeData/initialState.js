// use GraphQL instead!
//import { initialPatientState } from "./patients";
//import { initialDevicesState } from "./devices";
import { initialPatientState, initialDevicesState } from "./get-from-graphsql";

import { initialTestResultsState } from "./testResults";
import { initialOrganizationState } from "./orgs";
// import { initialUserState } from "./users";
import { initialTestQueueState } from "./testQueue";

require("./get-from-graphsql.js");

console.log("initialState: " + initialPatientState);

export const initialState = {
  patients: initialPatientState,
  testResults: initialTestResultsState,
  testQueue: initialTestQueueState,
  organization: initialOrganizationState,
  devices: initialDevicesState,
  // user: initialUserState,
};
