import { faSlidersH } from "@fortawesome/free-solid-svg-icons";
import React from "react";

import Dropdown, { Option } from "../../commonComponents/Dropdown";
import Button from "../../commonComponents/Button/Button";

import { ManageFacilityState } from "./ManageFacility";

export interface FacilitySelectFilterProps {
  organizationOptions: Option[];
  facilityOptions: Option[];
  onClearFilter: () => void;
  onSelectOrg: (e: any) => void;
  onSelectFacility: (e: any) => void;
  manageFacilityState: ManageFacilityState;
}

const FacilitySelectFilter: React.FC<FacilitySelectFilterProps> = ({
  organizationOptions,
  facilityOptions,
  manageFacilityState,
  onClearFilter,
  onSelectOrg,
  onSelectFacility,
}) => {
  /**
   * HTML
   */
  return (
    <div className="prime-container card-container padding-bottom-3">
      <div className="usa-card__header">
        <div className="grid-row width-full">
          <h1 className="desktop:grid-col-fill tablet:grid-col-fill mobile:grid-col-12 font-heading-lg margin-top-0 margin-bottom-0">
            Manage facility
          </h1>
          <div className="desktop:grid-col-auto tablet:grid-col-auto mobile:grid-col-12">
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
      <div className="bg-base-lightest padding-left-3 padding-right-3 padding-bottom-1">
        <div className="grid-row grid-gap padding-bottom-2">
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
              disabled={false}
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
                ...facilityOptions,
              ]}
              onChange={onSelectFacility}
              selectedValue={manageFacilityState.facilityId}
              disabled={manageFacilityState.orgId === ""}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilitySelectFilter;
