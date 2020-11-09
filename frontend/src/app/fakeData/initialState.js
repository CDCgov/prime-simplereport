// use GraphQL instead!
import { initialPatientState } from "./patients";
import { initialTestResultsState } from "./testResults";
import { initialOrganizationState } from "./orgs";
import { initialDevicesState } from "./devices";
// import { initialUserState } from "./users";
import { initialTestQueueState } from "./testQueue";

import { ApolloClient, InMemoryCache } from "@apollo/client";
import { gql } from "@apollo/client";

const aclient = new ApolloClient({
  uri: "http://localhost:4000",
  cache: new InMemoryCache(),
});

aclient
  .query({
    query: gql`
      query GetInitialPatientState {
        patients {
          patientId
          firstName
          middleName
          lastName
          birthDate
          address
          phone
        }
      }
    `,
  })
  .then((result) => console.log(result.data.patients));
console.log(initialPatientState);

export const initialState = {
  patients: initialPatientState,
  testResults: initialTestResultsState,
  testQueue: initialTestQueueState,
  organization: initialOrganizationState,
  devices: initialDevicesState,
  // user: initialUserState,
};
