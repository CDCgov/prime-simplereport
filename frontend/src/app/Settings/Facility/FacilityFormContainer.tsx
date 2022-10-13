import { useState } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Navigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";

import { updateFacility } from "../../store";
import { showSuccess } from "../../utils/srToast";
import { getAppInsights } from "../../TelemetryService";
import { useSelectedFacility } from "../../facilitySelect/useSelectedFacility";

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
    $devices: [ID]!
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
      deviceIds: $devices
    ) {
      id
    }
  }
`;

export const ADD_FACILITY_MUTATION = gql`
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
    $devices: [ID]!
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
      deviceIds: $devices
    ) {
      id
    }
  }
`;

interface Props {
  newOrg?: boolean;
}

const FacilityFormContainer: any = (props: Props) => {
  const { facilityId } = useParams();
  const [activeFacility] = useSelectedFacility();
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
    return (
      <Navigate to={`/settings/facilities?facility=${activeFacility?.id}`} />
    );
  }

  const saveFacility = async (facility: Facility) => {
    if (appInsights) {
      appInsights.trackEvent({ name: "Save Settings" });
    }
    const provider = facility.orderingProvider;
    const saveFacilityMutation = facilityId
      ? updateFacilityMutation
      : addFacilityMutation;
    const savedFacility = await saveFacilityMutation({
      variables: {
        facilityId,
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
          ? savedFacility.data.updateFacility.id
          : savedFacility.data.addFacility.id,
    }));
    showSuccess(
      "The settings for the facility have been updated",
      "Updated Facility"
    );
    updateSaveSuccess(true);
  };

  const getFacilityData = (): Facility => {
    const facility = data.organization.testingFacility.find(
      (f) => f.id === facilityId
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
