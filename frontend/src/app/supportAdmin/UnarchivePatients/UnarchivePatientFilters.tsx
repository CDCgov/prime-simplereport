import { useForm } from "react-hook-form";
import React from "react";
import { faSlidersH } from "@fortawesome/free-solid-svg-icons";

import Select, { Option } from "../../commonComponents/Select";
import Button from "../../commonComponents/Button/Button";
import { unarchivePatientTitle } from "../pageTitles";

import { UnarchivePatientState } from "./UnarchivePatient";

interface UnarchivePatientProps {
  orgOptions: Option<string>[];
  onSelectOrg: (orgInternalId: string) => void;
  onSelectFacility: (id: string) => void;
  onSearch: () => void;
  onClearFilter: () => void;
  loading: boolean;
  unarchivePatientState: UnarchivePatientState;
}
const UnarchivePatientFilters = ({
  orgOptions,
  onSelectOrg,
  onSelectFacility,
  onSearch,
  onClearFilter,
  loading,
  unarchivePatientState,
}: UnarchivePatientProps) => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({});

  return (
    <div className="prime-container card-container">
      <div className="usa-card__header">
        <div className="desktop:display-flex grid-row width-full">
          <div className="desktop:grid-col-6 desktop:display-flex desktop:flex-row flex-align-center">
            <h1 className="font-sans-lg margin-y-0">{unarchivePatientTitle}</h1>
          </div>
          <div className="mobile-lg:display-block mobile-lg:grid-col-6 desktop:display-flex flex-align-end flex-column">
            <Button
              icon={faSlidersH}
              disabled={unarchivePatientState.orgId === ""}
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
          <div className={"desktop:grid-col-4 mobile-lg:grid-col-12"}>
            <Select
              label="Organization"
              name="organization"
              value={unarchivePatientState.orgId}
              defaultOption={"- Select -"}
              defaultSelect={true}
              required={true}
              options={orgOptions}
              disabled={loading}
              registrationProps={register("organization", {
                onChange: (e) => onSelectOrg(e.target.value),
                required: true,
              })}
              validationStatus={
                errors?.organization?.type === "required" ? "error" : undefined
              }
              errorMessage="Organization is required"
            />
          </div>
          <div className={"desktop:grid-col-4 mobile-lg:grid-col-12"}>
            <Select
              label="Testing facility"
              name="facilities"
              defaultOption={"- Select -"}
              defaultSelect={true}
              required={true}
              value={unarchivePatientState.facilityId}
              options={
                unarchivePatientState.facilities.map((facility) => ({
                  value: facility.id,
                  label: facility.name,
                })) ?? []
              }
              disabled={loading}
              registrationProps={register("facility", {
                onChange: (e) => onSelectFacility(e.target.value),
                required: true,
              })}
              validationStatus={
                errors?.facility?.type === "required" ? "error" : undefined
              }
              errorMessage="Testing facility is required"
            />
          </div>
          <div className="margin-top-3">
            <Button
              type="submit"
              label="Search"
              className="margin-right-0"
              disabled={loading}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnarchivePatientFilters;
