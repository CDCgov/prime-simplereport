import { ApolloClient, InMemoryCache } from "@apollo/client";
import { gql } from "@apollo/client";

const aclient = new ApolloClient({
  uri: "http://localhost:4000",
  cache: new InMemoryCache(),
});

// hey friends did I mention this is a proof of concept? Right, right.
// I'm not good at promises and managing async, this can DEFINITELY be done better
// eh? lol

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
  .then((presult) => {
    // This is a proof of concept hack - only because currently we expect an object. When we re-write
    // this to work with graphsql directly we will change this.
    presult.data.patients.forEach((p) => {
      initialPatientState[p.patientId] = p;
    });
    aclient
      .query({
        query: gql`
          query GetInitialDevicesState {
            devices {
              deviceId
              deviceModel
              deviceManufacturer
            }
          }
        `,
      })
      .then((dresult) => {
        dresult.data.devices.forEach((d) => {
          initialDevicesState[d.deviceId] = d;
        });
      });
  });
