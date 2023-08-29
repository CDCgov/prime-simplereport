import React, { useRef, useState } from "react";
import { ComboBoxRef } from "@trussworks/react-uswds";

import { Option } from "../../commonComponents/Dropdown";
import {
  useDeleteFacilityMutation,
  useGetAllOrganizationsQuery,
  useGetFacilitiesByOrgIdLazyQuery,
  useGetFacilityStatsLazyQuery,
} from "../../../generated/graphql";
import { useDocumentTitle } from "../../utils/hooks";
import { showSuccess } from "../../utils/srToast";
import { manageFacility } from "../pageTitles";

import FacilitySelectFilter from "./FacilitySelectFilter";
import FacilityInformation from "./FacilityInformation";

type Facility = {
  id: string;
  name: string;
  city: string | null | undefined;
  state: string;
  zipcode: string;
  org: string;
  orgType: string;
  usersCount: number;
  patientsCount: number;
};

export interface ManageFacilityState {
  orgId: string | undefined;
  facilityId: string | undefined;
  facility: Facility | undefined;
}

export const initialState: ManageFacilityState = {
  facilityId: undefined,
  orgId: undefined,
  facility: undefined,
};

const ManageFacility = () => {
  useDocumentTitle(manageFacility);
  const [localState, updateLocalState] =
    useState<ManageFacilityState>(initialState);
  const orgSelectionRef = useRef<ComboBoxRef>(null);
  const facilitySelectionRef = useRef<ComboBoxRef>(null);

  /**
   * Fetch organizations (on initial load)
   */
  const { data: orgResponse, loading: loadingOrgs } =
    useGetAllOrganizationsQuery({
      onCompleted: () => {
        // for some reason, our combination of Truss + Apollo requires us clear
        // a non-existent ref so that the options to the org combobox loads
        // on first try. If we exclude this line, the fetched data doesn't load
        // on initial render. ¯\_(ツ)_/¯
        orgSelectionRef.current?.clearSelection();
      },
    });

  const orgOptions: Option[] =
    orgResponse?.organizations?.map((org) => ({
      value: org.id,
      label: org.name,
    })) ?? [];

  /**
   * Fetch facilities
   */
  const [
    queryGetFacilitiesByOrgId,
    { data: facilitiesResponse, loading: loadingFacilities },
  ] = useGetFacilitiesByOrgIdLazyQuery();

  const facilitiesOptions: Option[] =
    localState.orgId === undefined ||
    !facilitiesResponse?.organization?.facilities
      ? []
      : facilitiesResponse?.organization?.facilities.map((facility) => ({
          value: facility.id,
          label: facility.name,
        }));

  /**
   * Fetch facility stats
   */
  const [queryGetFacilityStats] = useGetFacilityStatsLazyQuery();

  /**
   * Facility select filter handlers
   */
  function handleSelectOrganization(selectedOrg: string | undefined) {
    if (selectedOrg) {
      queryGetFacilitiesByOrgId({
        variables: { orgId: selectedOrg },
        fetchPolicy: "no-cache",
      }).then(() => facilitySelectionRef.current?.clearSelection());

      updateLocalState({
        facility: undefined,
        facilityId: undefined,
        orgId: selectedOrg,
      });
    } else {
      orgSelectionRef.current?.clearSelection();
      facilitySelectionRef.current?.clearSelection();

      updateLocalState({
        facility: undefined,
        facilityId: undefined,
        orgId: undefined,
      });
    }
  }

  async function handleSelectFacility(selectedFacility: string | undefined) {
    updateLocalState((prevState) => ({
      ...prevState,
      facilityId: selectedFacility,
    }));
  }

  async function handleSearch() {
    const facilityId = localState.facilityId;

    if (facilityId === undefined) {
      updateLocalState((prevState) => ({
        ...prevState,
        facility: undefined,
      }));
    } else {
      const localSelectedFacilityId = localState.facilityId as string;
      const selectedFacility =
        facilitiesResponse?.organization?.facilities?.filter(
          (f) => f.id === localSelectedFacilityId
        )?.[0];

      const facilityStats = await queryGetFacilityStats({
        fetchPolicy: "no-cache",
        variables: { facilityId: localSelectedFacilityId },
      }).then((response) => response.data?.facilityStats);

      updateLocalState((prevState) => ({
        ...prevState,
        selectedFacilityId: localSelectedFacilityId,
        facility: {
          city: selectedFacility?.city || "",
          state: selectedFacility?.state || "",
          zipcode: selectedFacility?.zipCode || "",
          id: selectedFacility?.id || "",
          name: selectedFacility?.name || "",
          org: facilitiesResponse?.organization?.name || "",
          orgType: facilitiesResponse?.organization?.type || "",
          usersCount: facilityStats?.usersSingleAccessCount || 0,
          patientsCount: facilityStats?.patientsSingleAccessCount || 0,
        },
      }));
    }
  }

  function handleClearFilter() {
    orgSelectionRef.current?.clearSelection();
    facilitySelectionRef.current?.clearSelection();
  }

  /**
   * Delete facility
   */
  const [deleteFacilityMutation] = useDeleteFacilityMutation();

  function handleDeleteFacility() {
    if (localState.facilityId) {
      deleteFacilityMutation({
        variables: { facilityId: localState.facilityId },
      }).then(() => {
        showSuccess(
          "",
          `Facility ${localState.facility?.name} successfully deleted`
        );
        handleClearFilter();
      });
    }
  }

  /**
   * HTML
   */
  return (
    <div className="prime-home flex-1">
      <div className="grid-container">
        <FacilitySelectFilter
          onSelectFacility={handleSelectFacility}
          onClearFilter={handleClearFilter}
          onSelectOrg={handleSelectOrganization}
          onSearch={handleSearch}
          facilityRef={facilitySelectionRef}
          orgRef={orgSelectionRef}
          facilityOptions={facilitiesOptions}
          organizationOptions={orgOptions}
          manageFacilityState={localState}
          loading={loadingOrgs || loadingFacilities}
        />
        <FacilityInformation
          manageFacilityState={localState}
          onFacilityDelete={handleDeleteFacility}
        />
      </div>
    </div>
  );
};

export default ManageFacility;
