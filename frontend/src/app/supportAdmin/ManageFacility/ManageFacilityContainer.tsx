import React, { useEffect, useState } from "react";

import { useDocumentTitle } from "../../utils/hooks";
import PageContainer from "../PageContainer";
import Dropdown, { Option } from "../../commonComponents/Dropdown";
import {
  useGetAllOrganizationsQuery,
  useGetFacilitiesByOrgIdLazyQuery,
} from "../../../generated/graphql";

const ManageFacilityContainer = () => {
  useDocumentTitle("Manage Facility");

  /**
   * Initialize (org dropdown)
   */
  const [orgId, setOrgId] = useState<string>("");
  const { loading: loadingOrgs, data: orgResponse } =
    useGetAllOrganizationsQuery();
  const orgOptions: Option[] =
    orgResponse?.organizations?.map((org) => ({
      value: org.externalId,
      label: org.name,
    })) ?? [];

  /**
   * Fetch facilities by org
   */
  const [queryGetFacilitiesByOrgId, { data: facilitiesResponse }] =
    useGetFacilitiesByOrgIdLazyQuery();

  useEffect(() => {
    if (orgId !== "") {
      queryGetFacilitiesByOrgId({ variables: { orgId } });
    }
  }, [orgId, queryGetFacilitiesByOrgId]);

  const facilitiesOptions: Option[] =
    facilitiesResponse?.organization?.facilities.map((facility) => ({
      value: facility.id,
      label: facility.name,
    })) ?? [];

  /**
   * Retrieve facility
   */

  /**
   * Search controls
   */
  const searchControls = (
    <div className="grid-row grid-gap padding-bottom-2">
      <div className="desktop:grid-col-4 tablet:grid-col-4 mobile:grid-col-1">
        <Dropdown
          label="Organization"
          options={[
            {
              label: "- Select -",
              value: "",
            },
            ...orgOptions,
          ]}
          onChange={(e) => {
            setOrgId(e.target.value);
          }}
          selectedValue={orgId}
          disabled={loadingOrgs}
        />
      </div>
      <div className="desktop:grid-col-4 tablet:grid-col-4 mobile:grid-col-1">
        <Dropdown
          label="Facility"
          options={[
            {
              label: "- Select -",
              value: "",
            },
            ...facilitiesOptions,
          ]}
          onChange={() => {}}
          selectedValue={""}
          disabled={loadingOrgs || orgId === ""}
        />
      </div>
    </div>
  );

  /**
   * HTML
   */
  return (
    <PageContainer title="Manage facility" controls={searchControls}>
      <p className={"text-center padding-3"}>No facility selected</p>
    </PageContainer>
  );
};

export default ManageFacilityContainer;
