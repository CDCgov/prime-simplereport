import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";

import { updateFacility } from "../../store";
import { showSuccess } from "../../utils/srToast";
import { getAppInsights } from "../../TelemetryService";
import { useSelectedFacility } from "../../facilitySelect/useSelectedFacility";
import { useDocumentTitle } from "../../utils/hooks";
import {
  useAddFacilityMutation,
  useGetFacilitiesQuery,
  useUpdateFacilityMutation,
} from "../../../generated/graphql";

import FacilityForm from "./FacilityForm";

interface Props {
  newOrg?: boolean;
}

const FacilityFormContainer: any = (props: Props) => {
  useDocumentTitle("Add new facility");
  const { facilityId } = useParams();
  const [activeFacility] = useSelectedFacility();
  const { data, loading, error } = useGetFacilitiesQuery({
    fetchPolicy: "no-cache",
  });

  const appInsights = getAppInsights();

  const [updateFacilityMutation] = useUpdateFacilityMutation();
  const [addFacilityMutation] = useAddFacilityMutation();

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
    const facilityInfo = {
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
    };

    const savedFacilityId = facilityId
      ? await updateFacilityMutation({
          variables: {
            facilityId,
            ...facilityInfo,
          },
        }).then((response) => response?.data?.updateFacility?.id)
      : await addFacilityMutation({ variables: { ...facilityInfo } }).then(
          (response) => response?.data?.addFacility?.id
        );

    setFacilityData(() => ({
      ...facility,
      id: savedFacilityId as string,
    }));

    showSuccess(
      "The settings for the facility have been updated",
      "Updated Facility"
    );
    updateSaveSuccess(true);
  };

  const getFacilityData = (): Facility => {
    const facility = data?.organization?.testingFacility.find(
      (f) => f.id === facilityId
    );
    if (facility) {
      return facility as Facility;
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
