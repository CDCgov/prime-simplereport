import { faSlidersH } from "@fortawesome/free-solid-svg-icons";
import React from "react";

import Dropdown, { Option } from "../../commonComponents/Dropdown";
import Button from "../../commonComponents/Button/Button";
import SupportHomeLink from "../SupportHomeLink";

import { ManageFacilityState } from "./ManageFacility";

export interface FacilitySelectFilterProps {
  organizationOptions: Option[];
  facilityOptions: Option[];
  onClearFilter: () => void;
  onSelectOrg: (e: any) => void;
  onSelectFacility: (e: any) => void;
  onSearch: (e: any) => void;
  manageFacilityState: ManageFacilityState;
  loading: boolean;
}

const FacilitySelectFilter: React.FC<FacilitySelectFilterProps> = ({
  organizationOptions,
  facilityOptions,
  manageFacilityState,
  onClearFilter,
  onSelectOrg,
  onSelectFacility,
  onSearch,
  loading,
}) => {
  /**
   * HTML
   */
  return (
    <div className="prime-container card-container padding-bottom-3">
      <div className="usa-card__header">
        <div className="width-full">
          <SupportHomeLink />
          <div className="grid-row width-full margin-top-1">
            <h1 className="desktop:grid-col-fill tablet:grid-col-fill mobile:grid-col-12 font-heading-lg margin-bottom-0">
              Manage facility
            </h1>
            <div className="desktop:grid-col-auto tablet:grid-col-auto mobile:grid-col-12 margin-top-2 tablet:margin-top-0">
              <Button
                icon={faSlidersH}
                disabled={manageFacilityState.orgId === ""}
                onClick={onClearFilter}
                ariaLabel="Clear facility selection filters"
              >
                Clear filters
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div
        role="search"
        className="bg-base-lightest padding-left-3 padding-right-3 padding-bottom-1"
      >
        <div className="grid-row grid-gap padding-bottom-2 flex-align-end">
          <div className="desktop:grid-col-4 tablet:grid-col-4 mobile:grid-col-1">
            <Dropdown
              label="Organization"
              options={[
                {
                  label: "- Select -",
                  value: "",
                },
                ...organizationOptions,
              ]}
              onChange={onSelectOrg}
              selectedValue={manageFacilityState.orgId}
              disabled={loading}
              required={true}
            />
          </div>
          <div className="desktop:grid-col-4 tablet:grid-col-4 mobile:grid-col-1">
            <Dropdown
              label="Testing facility"
              options={[
                {
                  label: "- Select -",
                  value: "",
                },
                ...facilityOptions,
              ]}
              onChange={onSelectFacility}
              selectedValue={manageFacilityState.facilityId}
              disabled={loading}
              required={true}
            />
          </div>
          <div className="desktop:grid-col-4 tablet:grid-col-4 mobile:grid-col-1">
            <Button onClick={onSearch} ariaLabel="Search facility selection">
              Search
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilitySelectFilter;
