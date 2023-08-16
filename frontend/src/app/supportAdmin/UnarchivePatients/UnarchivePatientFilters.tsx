import { useForm } from "react-hook-form";
import React from "react";
import { faSlidersH } from "@fortawesome/free-solid-svg-icons";

import Select, { Option } from "../../commonComponents/Select";
import Button from "../../commonComponents/Button/Button";
import { unarchivePatientTitle } from "../pageTitles";

import { UnarchivePatientState } from "./UnarchivePatient";

interface UnarchivePatientProps {
  currentPage: number;
  orgOptions: Option<string>[];
  onSelectOrg: (orgInternalId: string) => void;
  onSelectFacility: (id: string) => void;
  onSearch: () => void;
  onClearFilter: () => void;
  loading: boolean;
  unarchivePatientState: UnarchivePatientState;
}
const UnarchivePatientFilters = ({
  currentPage,
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

  const displayPagination = () => {
    if (
      !loading &&
      unarchivePatientState.patients &&
      unarchivePatientState.patientsCount
    ) {
      return (
        unarchivePatientState.patientsCount > 0 &&
        unarchivePatientState.patients.length > 0
      );
    } else {
      return false;
    }
  };

  return (
    <div className="prime-container card-container">
      <div className="usa-card__header">
        <div className="desktop:display-flex grid-row width-full">
          <div className="desktop:grid-col-6 desktop:display-flex desktop:flex-row flex-align-center">
            <h1 className="font-sans-lg margin-y-0">{unarchivePatientTitle}</h1>
            <span className="sr-showing-patients-on-page desktop:margin-left-4">
              {loading && "Loading..."}
              {displayPagination() && (
                <>
                  Showing{" "}
                  {(currentPage - 1) * unarchivePatientState.entriesPerPage + 1}
                  -
                  {Math.min(
                    unarchivePatientState.entriesPerPage * currentPage,
                    unarchivePatientState.patientsCount ?? 0
                  )}{" "}
                  of {unarchivePatientState.patientsCount}
                </>
              )}
            </span>
          </div>
          <div className="mobile-lg:display-block mobile-lg:grid-col-6 desktop:display-flex flex-align-end flex-column">
            <Button
              icon={faSlidersH}
              disabled={unarchivePatientState.orgId === "" || loading}
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
              defaultOption={"Select an organization"}
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
              defaultOption={"Select a testing facility"}
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
