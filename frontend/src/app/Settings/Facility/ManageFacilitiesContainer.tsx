import React from "react";
import { gql, useQuery } from "@apollo/client";
import ManageFacilities from "./ManageFacilities";

const GET_SETTINGS_QUERY = gql`
  {
    organization {
      testingFacility {
        id
        cliaNumber
        name
        street
        streetTwo
        city
        county
        state
        zipCode
        phone
        defaultDeviceType {
          internalId
        }
        deviceTypes {
          internalId
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
          county
          state
          zipCode
          phone
        }
      }
    }
    deviceType {
      internalId
      name
    }
  }
`;

const ManageFacilitiesContainer: any = () => {
  const { data, loading, error } = useQuery<SettingsData, {}>(
    GET_SETTINGS_QUERY,
    {
      fetchPolicy: "no-cache",
    }
  );

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
