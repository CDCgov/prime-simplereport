import React from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import {
  useAppInsightsContext,
  useTrackEvent,
} from "@microsoft/applicationinsights-react-js";

import Alert from "../../commonComponents/Alert";
import { showNotification } from "../../utils";
import FacilityForm from "./FacilityForm";

const GET_FACILITY_QUERY = gql`
  {
    organization {
      internalId
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

const SET_FACILITY_MUTATION = gql`
  mutation(
    $testingFacilityName: String!
    $cliaNumber: String
    $orderingProviderFirstName: String!
    $orderingProviderMiddleName: String
    $orderingProviderLastName: String!
    $orderingProviderSuffix: String
    $orderingProviderNPI: String!
    $orderingProviderStreet: String
    $orderingProviderStreetTwo: String
    $orderingProviderCity: String
    $orderingProviderCounty: String
    $orderingProviderState: String
    $orderingProviderZipCode: String!
    $orderingProviderPhone: String
    $devices: [String]!
    $defaultDevice: String!
  ) {
    updateFacility(
      testingFacilityName: $testingFacilityName
      cliaNumber: $cliaNumber
      orderingProviderFirstName: $orderingProviderFirstName
      orderingProviderMiddleName: $orderingProviderMiddleName
      orderingProviderLastName: $orderingProviderLastName
      orderingProviderSuffix: $orderingProviderSuffix
      orderingProviderNPI: $orderingProviderNPI
      orderingProviderStreet: $orderingProviderStreet
      orderingProviderStreetTwo: $orderingProviderStreetTwo
      orderingProviderCity: $orderingProviderCity
      orderingProviderCounty: $orderingProviderCounty
      orderingProviderState: $orderingProviderState
      orderingProviderZipCode: $orderingProviderZipCode
      orderingProviderPhone: $orderingProviderPhone
      deviceTypes: $devices
      defaultDevice: $defaultDevice
    )
  }
`;

interface Props {
  facilityId: string;
}

const FacilityFormContainer: any = (props: Props) => {
  const { data, loading, error } = useQuery<FacilityData, {}>(
    GET_FACILITY_QUERY,
    {
      fetchPolicy: "no-cache",
    }
  );
  const appInsights = useAppInsightsContext();
  const [setSettings] = useMutation(SET_FACILITY_MUTATION);
  const trackSaveSettings = useTrackEvent(
    appInsights,
    "Save Settings",
    null,
    false
  );

  if (loading) {
    return <p> Loading... </p>;
  }
  if (error) {
    return error;
  }

  if (data === undefined) {
    return <p>Error: facility not found</p>;
  }

  const saveFacility = (facility: Facility) => {
    trackSaveSettings(null);
    const provider = facility.orderingProvider;
    setSettings({
      variables: {
        testingFacilityName: facility.name,
        cliaNumber: facility.cliaNumber,
        orderingProviderFirstName: provider.firstName,
        orderingProviderMiddleName: provider.middleName,
        orderingProviderLastName: provider.lastName,
        orderingProviderSuffix: provider.suffix,
        orderingProviderNPI: provider.NPI,
        orderingProviderStreet: provider.street,
        orderingProviderStreetTwo: provider.streetTwo,
        orderingProviderCity: provider.city,
        orderingProviderCounty: provider.county,
        orderingProviderState: provider.state,
        orderingProviderZipCode: provider.zipCode,
        orderingProviderPhone: provider.phone,
        devices: facility.deviceTypes,
        defaultDevice: facility.defaultDevice,
      },
    }).then(() => {
      let alert = (
        <Alert
          type={"success"}
          title={"Updated Organization"}
          body={"The settings for the organization have been updated"}
          role={"success"}
        />
      );
      showNotification(toast, alert);
    });
  };

  let deviceTypes = Object.values(
    data.organization.testingFacility[0].deviceTypes
  ).map((d) => d.internalId);
  return (
    <FacilityForm
      facility={{
        ...((data.organization.testingFacility.find(
          (f) => f.id === props.facilityId
        ) as any) as Facility),
        deviceTypes: deviceTypes,
        defaultDevice: data.organization.testingFacility[0].defaultDeviceType
          ? data.organization.testingFacility[0].defaultDeviceType.internalId
          : "",
      }}
      deviceOptions={data.deviceType}
      saveFacility={saveFacility}
    />
  );
};

export default FacilityFormContainer;
