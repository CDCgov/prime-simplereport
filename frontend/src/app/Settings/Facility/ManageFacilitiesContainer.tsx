import React from "react";
import { gql, useQuery } from "@apollo/client";

import ManageFacilities from "./ManageFacilities";

const GET_FACILITIES = gql`
  query GetManagedFacilities {
    organization {
      testingFacility {
        id
        cliaNumber
        name
        street
        streetTwo
        city
        state
        zipCode
        phone
        email
        defaultDeviceType {
          internalId
        }
        deviceTypes {
          internalId
        }
        deviceSpecimenTypes {
          deviceType {
            internalId
          }
          specimenType {
            internalId
          }
        }
        orderingProvider {
          firstName
          middleName
          lastName
          suffix
          NPI
          street
          streetTwo
          city
          state
          zipCode
          phone
        }
      }
    }
  }
`;

const ManageFacilitiesContainer: any = () => {
  const { data, loading, error } = useQuery<SettingsData, {}>(GET_FACILITIES, {
    fetchPolicy: "no-cache",
  });

  if (loading) {
    return <p> Loading... </p>;
  }
  if (error) {
    return error;
  }

  if (data === undefined) {
    return <p>Error: facilities not found</p>;
  }

  const facilities: Facility[] = data.organization.testingFacility.map((f) => {
    return {
      ...f,
      defaultDevice: f.defaultDeviceType ? f.defaultDeviceType.internalId : "",
      deviceTypes: Object.values(f.deviceTypes).map((d) => d.internalId),
    };
  });

  return <ManageFacilities facilities={facilities} />;
};

export default ManageFacilitiesContainer;
