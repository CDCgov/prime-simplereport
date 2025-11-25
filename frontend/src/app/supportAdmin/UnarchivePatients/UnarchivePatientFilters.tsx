import { useForm } from "react-hook-form";
import React, { Ref } from "react";
import { faSlidersH } from "@fortawesome/free-solid-svg-icons";
import { ComboBoxRef } from "@trussworks/react-uswds";

import { Option } from "../../commonComponents/Select";
import Button from "../../commonComponents/Button/Button";
import { unarchivePatientTitle } from "../pageTitles";
import SupportHomeLink from "../SupportHomeLink";
import ComboBox from "../../commonComponents/ComboBox";

interface UnarchivePatientProps {
  orgOptions: Option<string>[];
  facilityOptions: Option<string>[];
  onSelectOrg: (orgInternalId: string | undefined) => void;
  onSelectFacility: (id: string | undefined) => void;
  onSearch: () => void;
  onClearFilter: () => void;
  loading: boolean;
  disableClearFilters: boolean;
  disableSearch: boolean;
  facilityRef: Ref<ComboBoxRef> | undefined;
  orgRef: Ref<ComboBoxRef> | undefined;
}

const UnarchivePatientFilters = ({
  orgOptions,
  facilityOptions,
  onSelectOrg,
  onSelectFacility,
  onSearch,
  onClearFilter,
  loading,
  disableClearFilters,
  disableSearch,
  orgRef,
  facilityRef,
}: UnarchivePatientProps) => {
  const { handleSubmit } = useForm({});

  return (
    <div className="prime-container card-container">
      <div className="width-full display-block margin-left-3 margin-top-3">
        <SupportHomeLink />
      </div>
      <div className="usa-card__header padding-top-2">
        <div className="desktop:display-flex grid-row width-full">
          <div className="desktop:grid-col-6 desktop:display-flex desktop:flex-row flex-align-center">
            <h1 className="margin-y-0">{unarchivePatientTitle}</h1>
          </div>
          <div className="mobile-lg:display-block mobile-lg:grid-col-6 desktop:display-flex flex-align-end flex-column">
            <Button
              icon={faSlidersH}
              disabled={disableClearFilters}
              onClick={() => onClearFilter()}
              ariaLabel="Clear facility selection filters"
            >
              Clear filters
            </Button>
          </div>
        </div>
      </div>
      <div className="bg-base-lightest">
        <form
          className="display-flex grid-row grid-gap flex-row flex-align-end padding-x-3 padding-y-2"
          role="search"
          onSubmit={handleSubmit(onSearch)}
        >
          <div
            data-testid={"org-selection-container"}
            className={"desktop:grid-col-4 mobile-lg:grid-col-12"}
          >
            <ComboBox
              name={"Organization"}
              id={"unarchive-patient-org-select"}
              required={true}
              options={orgOptions}
              disabled={loading}
              onChange={(e) => onSelectOrg(e)}
              ref={orgRef}
            />
          </div>
          <div
            data-testid={"facility-selection-container"}
            className={"desktop:grid-col-4 mobile-lg:grid-col-12"}
          >
            <ComboBox
              name={"Testing facility"}
              id={"unarchive-patient-facility-select"}
              required={true}
              options={facilityOptions}
              disabled={loading}
              onChange={(e) => onSelectFacility(e)}
              ref={facilityRef}
            />
          </div>
          <div className="margin-top-3">
            <Button
              type="submit"
              label="Search"
              className="margin-right-0"
              disabled={disableSearch}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnarchivePatientFilters;
