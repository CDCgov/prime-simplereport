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

const UPDATE_FACILITY_MUTATION = gql`
  mutation(
    $facilityId: String!
    $testingFacilityName: String!
    $cliaNumber: String
    $street: String
    $streetTwo: String
    $city: String
    $county: String
    $state: String
    $zipCode: String!
    $phone: String
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
      facilityId: $facilityId
      testingFacilityName: $testingFacilityName
      cliaNumber: $cliaNumber
      street: $street
      streetTwo: $streetTwo
      city: $city
      county: $county
      state: $state
      zipCode: $zipCode
      phone: $phone
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

const ADD_FACILITY_MUTATION = gql`
  mutation(
    $testingFacilityName: String!
    $cliaNumber: String
    $street: String
    $streetTwo: String
    $city: String
    $county: String
    $state: String
    $zipCode: String!
    $phone: String
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
    addFacility(
      testingFacilityName: $testingFacilityName
      cliaNumber: $cliaNumber
      street: $street
      streetTwo: $streetTwo
      city: $city
      county: $county
      state: $state
      zipCode: $zipCode
      phone: $phone
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
  const [updateFacility] = useMutation(UPDATE_FACILITY_MUTATION);
  const [addFacility] = useMutation(ADD_FACILITY_MUTATION);
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
    const saveFacility = props.facilityId ? updateFacility : addFacility;
    saveFacility({
      variables: {
        facilityId: props.facilityId,
        testingFacilityName: facility.name,
        cliaNumber: facility.cliaNumber,
        street: facility.street,
        streetTwo: facility.streetTwo,
        city: facility.city,
        county: facility.county,
        state: facility.state,
        zipCode: facility.zipCode,
        phone: facility.phone,
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
          type="success"
          title="Updated Facility"
          body="The settings for the facility have been updated"
        />
      );
      showNotification(toast, alert);
    });
  };

  const getFacilityData = (): Facility => {
    const facility = data.organization.testingFacility.find(
      (f) => f.id === props.facilityId
    );
    if (facility) {
      let deviceTypes = Object.values(facility.deviceTypes).map(
        (d) => d.internalId
      );
      return {
        ...facility,
        deviceTypes: deviceTypes,
        defaultDevice: facility.defaultDeviceType
          ? facility.defaultDeviceType.internalId
          : "",
      };
    }
    const defaultDevice = data.deviceType[0].internalId;
    return {
      id: "",
      name: "",
      cliaNumber: "",
      street: "",
      streetTwo: "",
      city: "",
      county: "",
      state: "",
      zipCode: "",
      phone: "",
      orderingProvider: {
        firstName: "",
        middleName: "",
        lastName: "",
        suffix: "",
        NPI: "",
        street: "",
        streetTwo: "",
        city: "",
        county: "",
        state: "",
        zipCode: "",
        phone: "",
      },
      deviceTypes: [defaultDevice],
      defaultDevice,
    };
  };

  return (
    <FacilityForm
      facility={getFacilityData()}
      deviceOptions={data.deviceType}
      saveFacility={saveFacility}
    />
  );
};

export default FacilityFormContainer;
