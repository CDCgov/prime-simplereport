import { faSlidersH } from "@fortawesome/free-solid-svg-icons";
import React, { Ref } from "react";
import { ComboBoxRef } from "@trussworks/react-uswds";

import ComboBox from "../../commonComponents/ComboBox";
import Button from "../../commonComponents/Button/Button";
import SupportHomeLink from "../SupportHomeLink";
import { Option } from "../../commonComponents/Dropdown";

import { ManageFacilityState } from "./ManageFacility";

export interface FacilitySelectFilterProps {
  organizationOptions: Option[];
  facilityOptions: Option[];
  manageFacilityState: ManageFacilityState;
  onClearFilter: () => void;
  onSelectOrg: (selectedOrg: string | undefined) => void;
  onSelectFacility: (selectedFacility: string | undefined) => void;
  onSearch: (e: any) => void;
  loading: boolean;
  facilityRef: Ref<ComboBoxRef> | undefined;
  orgRef: Ref<ComboBoxRef> | undefined;
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
  facilityRef,
  orgRef,
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
            <h1 className="desktop:grid-col-fill tablet:grid-col-fill mobile:grid-col-12 margin-bottom-0">
              Manage facility
            </h1>
            <div className="desktop:grid-col-auto tablet:grid-col-auto mobile:grid-col-12 margin-top-2 tablet:margin-top-0">
              <Button
                icon={faSlidersH}
                disabled={manageFacilityState.orgId === undefined}
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
          <div
            data-testid={"org-selection-container"}
            className="desktop:grid-col-4 tablet:grid-col-4 mobile:grid-col-1 margin-top-1em"
          >
            <ComboBox
              name={"Organization"}
              id={"manage-facility-org-select"}
              options={organizationOptions}
              onChange={(val) => {
                onSelectOrg(val);
              }}
              disabled={loading}
              ref={orgRef}
              required
            />
          </div>
          <div
            data-testid={"facility-selection-container"}
            className="desktop:grid-col-4 tablet:grid-col-4 mobile:grid-col-1 margin-top-1em"
          >
            <ComboBox
              name={"Testing facility"}
              id={"manage-facility-facility-select"}
              options={facilityOptions}
              onChange={(val) => onSelectFacility(val)}
              disabled={loading}
              ref={facilityRef}
              required
            />
          </div>
          <div className="desktop:grid-col-4 tablet:grid-col-4 mobile:grid-col-1 ">
            <Button
              onClick={onSearch}
              disabled={manageFacilityState.facilityId === undefined}
              ariaLabel="Search facility selection"
            >
              Search
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilitySelectFilter;
