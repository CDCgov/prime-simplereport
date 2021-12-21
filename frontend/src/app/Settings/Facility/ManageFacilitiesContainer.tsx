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

  return <ManageFacilities facilities={data.organization.testingFacility} />;
};

export default ManageFacilitiesContainer;
