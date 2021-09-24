import React, { useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import {
  useAppInsightsContext,
  useTrackEvent,
} from "@microsoft/applicationinsights-react-js";
import { Redirect } from "react-router-dom";

import Alert from "../../commonComponents/Alert";
import { showNotification } from "../../utils";

import FacilityForm from "./FacilityForm";

export const GET_FACILITY_QUERY = gql`
  query GetFacilities {
    organization {
      internalId
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
          internalId
          deviceType {
            internalId
          }
          specimenType {
            internalId
            name
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
    deviceType {
      internalId
      name
    }
    specimenType {
      internalId
      name
    }
    deviceSpecimenTypes {
      internalId
      deviceType {
        internalId
        name
      }
      specimenType {
        internalId
        name
      }
    }
  }
`;

export const UPDATE_FACILITY_MUTATION = gql`
  mutation UpdateFacility(
    $facilityId: ID!
    $testingFacilityName: String!
    $cliaNumber: String
    $street: String!
    $streetTwo: String
    $city: String
    $state: String!
    $zipCode: String!
    $phone: String
    $email: String
    $orderingProviderFirstName: String
    $orderingProviderMiddleName: String
    $orderingProviderLastName: String
    $orderingProviderSuffix: String
    $orderingProviderNPI: String
    $orderingProviderStreet: String
    $orderingProviderStreetTwo: String
    $orderingProviderCity: String
    $orderingProviderState: String
    $orderingProviderZipCode: String
    $orderingProviderPhone: String
    $devices: [String]!
    $deviceSpecimenTypes: [DeviceSpecimenTypeInput]!
    $defaultDevice: String!
  ) {
    updateFacility(
      facilityId: $facilityId
      testingFacilityName: $testingFacilityName
      cliaNumber: $cliaNumber
      street: $street
      streetTwo: $streetTwo
      city: $city
      state: $state
      zipCode: $zipCode
      phone: $phone
      email: $email
      orderingProviderFirstName: $orderingProviderFirstName
      orderingProviderMiddleName: $orderingProviderMiddleName
      orderingProviderLastName: $orderingProviderLastName
      orderingProviderSuffix: $orderingProviderSuffix
      orderingProviderNPI: $orderingProviderNPI
      orderingProviderStreet: $orderingProviderStreet
      orderingProviderStreetTwo: $orderingProviderStreetTwo
      orderingProviderCity: $orderingProviderCity
      orderingProviderState: $orderingProviderState
      orderingProviderZipCode: $orderingProviderZipCode
      orderingProviderPhone: $orderingProviderPhone
      deviceTypes: $devices
      deviceSpecimenTypes: $deviceSpecimenTypes
      defaultDevice: $defaultDevice
    )
  }
`;

const ADD_FACILITY_MUTATION = gql`
  mutation AddFacility(
    $testingFacilityName: String!
    $cliaNumber: String
    $street: String!
    $streetTwo: String
    $city: String
    $state: String!
    $zipCode: String!
    $phone: String
    $email: String
    $orderingProviderFirstName: String
    $orderingProviderMiddleName: String
    $orderingProviderLastName: String
    $orderingProviderSuffix: String
    $orderingProviderNPI: String
    $orderingProviderStreet: String
    $orderingProviderStreetTwo: String
    $orderingProviderCity: String
    $orderingProviderState: String
    $orderingProviderZipCode: String
    $orderingProviderPhone: String
    $devices: [String]!
    $deviceSpecimenTypes: [DeviceSpecimenTypeInput]!
    $defaultDevice: String!
  ) {
    addFacility(
      testingFacilityName: $testingFacilityName
      cliaNumber: $cliaNumber
      street: $street
      streetTwo: $streetTwo
      city: $city
      state: $state
      zipCode: $zipCode
      phone: $phone
      email: $email
      orderingProviderFirstName: $orderingProviderFirstName
      orderingProviderMiddleName: $orderingProviderMiddleName
      orderingProviderLastName: $orderingProviderLastName
      orderingProviderSuffix: $orderingProviderSuffix
      orderingProviderNPI: $orderingProviderNPI
      orderingProviderStreet: $orderingProviderStreet
      orderingProviderStreetTwo: $orderingProviderStreetTwo
      orderingProviderCity: $orderingProviderCity
      orderingProviderState: $orderingProviderState
      orderingProviderZipCode: $orderingProviderZipCode
      orderingProviderPhone: $orderingProviderPhone
      deviceTypes: $devices
      deviceSpecimenTypes: $deviceSpecimenTypes
      defaultDevice: $defaultDevice
    )
  }
`;

interface Props {
  facilityId: string;
  newOrg?: boolean;
}

const FacilityFormContainer: any = (props: Props) => {
  const { data, loading, error } = useQuery<FacilityData, {}>(
    GET_FACILITY_QUERY
  );
  const appInsights = useAppInsightsContext();
  const [updateFacility] = useMutation(UPDATE_FACILITY_MUTATION);
  const [addFacility] = useMutation(ADD_FACILITY_MUTATION);
  const trackSaveSettings = useTrackEvent(appInsights, "Save Settings", null);
  const [saveSuccess, updateSaveSuccess] = useState(false);

  if (loading) {
    return <p> Loading... </p>;
  }
  if (error) {
    return error;
  }

  if (data === undefined) {
    return <p>Error: facility not found</p>;
  }
  if (saveSuccess) {
    if (props.newOrg) {
      window.location.pathname = process.env.PUBLIC_URL || "";
    }
    return <Redirect push to={{ pathname: "/settings/facilities" }} />;
  }

  const saveFacility = async (facility: Facility) => {
    if (appInsights) {
      trackSaveSettings(null);
    }
    const provider = facility.orderingProvider;
    const saveFacility = props.facilityId ? updateFacility : addFacility;
    await saveFacility({
      variables: {
        facilityId: props.facilityId,
        testingFacilityName: facility.name,
        cliaNumber: facility.cliaNumber,
        street: facility.street,
        streetTwo: facility.streetTwo,
        city: facility.city,
        state: facility.state,
        zipCode: facility.zipCode,
        phone: facility.phone,
        email: facility.email,
        orderingProviderFirstName: provider.firstName,
        orderingProviderMiddleName: provider.middleName,
        orderingProviderLastName: provider.lastName,
        orderingProviderSuffix: provider.suffix,
        orderingProviderNPI: provider.NPI,
        orderingProviderStreet: provider.street,
        orderingProviderStreetTwo: provider.streetTwo,
        orderingProviderCity: provider.city,
        orderingProviderState: provider.state,
        orderingProviderZipCode: provider.zipCode,
        orderingProviderPhone: provider.phone || null,
        devices: facility.deviceTypes,
        deviceSpecimenTypes: facility.deviceSpecimenTypes,
        defaultDevice: facility.defaultDevice,
      },
    });

    const alert = (
      <Alert
        type="success"
        title="Updated Facility"
        body="The settings for the facility have been updated"
      />
    );

    showNotification(alert);
    updateSaveSuccess(true);
  };

  const getFacilityData = (): Facility => {
    const facility = data.organization.testingFacility.find(
      (f) => f.id === props.facilityId
    );
    if (facility) {
      let deviceTypes = Object.values(facility.deviceSpecimenTypes).map(
        (dst) => dst.deviceType.internalId
      );
      return {
        ...facility,
        deviceTypes: deviceTypes,
        deviceSpecimenTypes: facility.deviceSpecimenTypes,
        /*
        deviceSpecimenTypes: facility.deviceSpecimenTypes.map((dst) => ({
          deviceType: dst.deviceType.internalId,
          specimenType: dst.specimenType.internalId,
        })),
        */
        defaultDevice: facility.defaultDeviceType
          ? facility.defaultDeviceType.internalId
          : "",
      };
    }
    const defaultDevice = data.deviceSpecimenTypes[0].deviceType.internalId;
    return {
      id: "",
      name: "",
      cliaNumber: "",
      street: "",
      streetTwo: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      email: "",
      orderingProvider: {
        firstName: "",
        middleName: "",
        lastName: "",
        suffix: "",
        NPI: "",
        street: "",
        streetTwo: "",
        city: "",
        state: "",
        zipCode: "",
        phone: "",
      },
      deviceTypes: [defaultDevice],
      deviceSpecimenTypes: [],
      /*
      deviceSpecimenTypes: [
        {
          internalId: "",
          deviceType: defaultDevice,
          specimenType: "",
        },
      ],
      */
      defaultDevice,
    };
  };

  return (
    <FacilityForm
      facility={getFacilityData()}
      deviceSpecimenTypeOptions={data.deviceSpecimenTypes}
      /*
      deviceOptions={data.deviceSpecimenTypes.map(dst => dst.deviceType)}
      specimenOptions={data.deviceSpecimenTypes.map(dst => dst.specimenType)}
      */
      saveFacility={saveFacility}
      newOrg={props.newOrg}
    />
  );
};

export default FacilityFormContainer;
