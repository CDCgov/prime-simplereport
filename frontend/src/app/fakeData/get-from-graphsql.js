import { ApolloClient, InMemoryCache } from "@apollo/client";
import { gql } from "@apollo/client";

const aclient = new ApolloClient({
  uri: "http://localhost:4000",
  cache: new InMemoryCache(),
});

// hey this is a proof of concept and in reality we'll probably pull this stuff directly in react
// not in javascript and I'm struggling with promises but just want to show how graphql works
// so I hacked this like a mofo.

const ips = {};
const ids = {};
aclient
  .query({
    query: gql`
      query GetInitialPatientState {
        patient {
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
      ips[p.patientId] = p;
    });
    aclient
      .query({
        query: gql`
          query GetInitialDevicesState {
            device {
              deviceId
              deviceModel
              deviceManufacturer
            }
          }
        `,
      })
      .then((dresult) => {
        dresult.data.devices.forEach((d) => {
          ids[d.deviceId] = d;
        });
        console.log(ips);
        console.log(ids);
      });
  });

export const initialPatientState = ips;
export const initialDevicesState = ids;
