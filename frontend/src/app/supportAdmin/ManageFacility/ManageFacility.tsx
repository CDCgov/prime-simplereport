import React, { useState } from "react";

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
  orgId: string;
  facilityId: string;
  facility: Facility | undefined;
}

export const initialState: ManageFacilityState = {
  orgId: "",
  facilityId: "",
  facility: undefined,
};

const ManageFacility = () => {
  useDocumentTitle(manageFacility);
  const [localState, updateLocalState] =
    useState<ManageFacilityState>(initialState);

  /**
   * Fetch organizations (on initial load)
   */
  const { data: orgResponse, loading: loadingOrgs } =
    useGetAllOrganizationsQuery();

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
    localState.orgId === "" || !facilitiesResponse?.organization?.facilities
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
  function handleSelectOrganization(e: React.ChangeEvent<HTMLSelectElement>) {
    const selectedOrg = e.target.value;
    if (selectedOrg !== "") {
      queryGetFacilitiesByOrgId({
        variables: { orgId: selectedOrg },
        fetchPolicy: "no-cache",
      }).then();
    }

    updateLocalState((prevState) => ({
      ...prevState,
      orgId: selectedOrg,
      facilityId: "",
    }));
  }
  async function handleSelectFacility(e: React.ChangeEvent<HTMLSelectElement>) {
    const facilityId = e.target.value;

    updateLocalState((prevState) => ({
      ...prevState,
      facilityId: facilityId,
    }));
  }

  async function handleSearch() {
    const facilityId = localState.facilityId;

    if (facilityId === "") {
      updateLocalState((prevState) => ({
        ...prevState,
        facility: undefined,
      }));
    } else {
      const selectedFacility =
        facilitiesResponse?.organization?.facilities?.filter(
          (f) => f.id === facilityId
        )?.[0];

      const facilityStats = await queryGetFacilityStats({
        fetchPolicy: "no-cache",
        variables: { facilityId },
      }).then((response) => response.data?.facilityStats);

      updateLocalState((prevState) => ({
        orgId: prevState.orgId,
        facilityId: facilityId,
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
    updateLocalState(initialState);
  }

  /**
   * Delete facility
   */
  const [deleteFacilityMutation] = useDeleteFacilityMutation();
  function handleDeleteFacility() {
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
