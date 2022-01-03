import { useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { Redirect } from "react-router-dom";
import { useDispatch } from "react-redux";

import { updateFacility } from "../../store";
import Alert from "../../commonComponents/Alert";
import { showNotification } from "../../utils";
import { getAppInsights } from "../../TelemetryService";

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
        deviceTypes {
          name
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
          state
          zipCode
          phone
        }
      }
    }
    deviceTypes {
      internalId
      name
    }
  }
`;

export const UPDATE_FACILITY_MUTATION = gql`
  mutation UpdateFacilityV3(
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
    $devices: [ID]!
  ) {
    updateFacilityV3(
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
      deviceIds: $devices
    ) {
      id
    }
  }
`;

const ADD_FACILITY_MUTATION = gql`
  mutation AddFacilityV3(
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
    $devices: [ID]!
  ) {
    addFacilityV3(
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
      deviceIds: $devices
    ) {
      id
    }
  }
`;

interface Props {
  facilityId: string;
  newOrg?: boolean;
}

const FacilityFormContainer: any = (props: Props) => {
  const { data, loading, error } = useQuery<FacilityData, {}>(
    GET_FACILITY_QUERY,
    {
      fetchPolicy: "no-cache",
    }
  );

  const appInsights = getAppInsights();
  const [updateFacilityMutation] = useMutation(UPDATE_FACILITY_MUTATION);
  const [addFacilityMutation] = useMutation(ADD_FACILITY_MUTATION);

  const [saveSuccess, updateSaveSuccess] = useState(false);
  const [facilityData, setFacilityData] = useState<Facility | null>(null);
  const dispatch = useDispatch();
  if (loading) {
    return <p> Loading... </p>;
  }
  if (error) {
    return error;
  }
  if (!data) {
    return <p>Error: facility not found</p>;
  }
  if (saveSuccess) {
    dispatch(updateFacility(facilityData));
    if (props.newOrg) {
      window.location.pathname = process.env.PUBLIC_URL || "";
    }
    return <Redirect push to={{ pathname: "/settings/facilities" }} />;
  }

  const saveFacility = async (facility: Facility) => {
    if (appInsights) {
      appInsights.trackEvent({ name: "Save Settings" });
    }
    const provider = facility.orderingProvider;
    const saveFacilityMutation = props.facilityId
      ? updateFacilityMutation
      : addFacilityMutation;
    const savedFacility = await saveFacilityMutation({
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
        devices: facility.deviceTypes.map((d) => d.internalId),
      },
    });
    setFacilityData(() => ({
      ...facility,
      id:
        saveFacilityMutation === updateFacilityMutation
          ? savedFacility.data.updateFacilityV2.id
          : savedFacility.data.addFacilityV2.id,
    }));
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
      return facility;
    }

    const dropdownDefaultDevice = data.deviceTypes[0];

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
      deviceTypes: [dropdownDefaultDevice],
    };
  };

  return (
    <FacilityForm
      facility={getFacilityData()}
      deviceTypes={data.deviceTypes}
      saveFacility={saveFacility}
      newOrg={props.newOrg}
    />
  );
};

export default FacilityFormContainer;
