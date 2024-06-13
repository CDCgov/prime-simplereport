import React from "react";
import { UseFormRegister, UseFormSetValue, FieldError } from "react-hook-form";

import Checkboxes from "../../commonComponents/Checkboxes";
import { Facility } from "../../../generated/graphql";

import { alphabeticalFacilitySort } from "./UserFacilitiesSettingsForm";

interface UserFacilitiesSettingProps {
  roleSelected: string;
  facilityList: Pick<Facility, "id" | "name">[];
  register: UseFormRegister<any>;
  error?: FieldError;
  setValue: UseFormSetValue<any>;
  disabled?: boolean;
}

// This is the react-hook-form supported version of UserFacilitiesSettingsForm.
const UserFacilitiesSettings: React.FC<UserFacilitiesSettingProps> = ({
  roleSelected,
  facilityList,
  register,
  error,
  setValue,
  disabled,
}) => {
  const isAdmin = roleSelected === "ADMIN";

  const facilityAccessDescription = isAdmin
    ? "Admins have access to all facilities"
    : "All users must have access to at least one facility";

  const allFacilities = [
    {
      name: `Access all facilities (${facilityList?.length || 0})`,
      id: "ALL_FACILITIES",
    },
  ].concat(facilityList?.sort(alphabeticalFacilitySort) || []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    if (value === "ALL_FACILITIES" && checked && setValue) {
      setValue("facilityIds", [
        ...allFacilities.map((facility) => facility.id),
      ]);
    }
  };

  const validateAtLeastOneCheck = (selectedOptions: string[]) => {
    return isAdmin || selectedOptions.length > 0;
  };

  const formRegistrationProps =
    register("facilityIds", {
      validate: validateAtLeastOneCheck,
      onChange,
    }) || {};

  let boxes = allFacilities?.map((facility) => ({
    value: facility.id,
    label: facility.name,
    ...formRegistrationProps,
  }));

  return (
    <Checkboxes
      boxes={boxes}
      legend="Facilities access"
      hintText={facilityAccessDescription}
      name="facilities-settings"
      required
      onChange={() => {}}
      validationStatus={error?.type ? "error" : undefined}
      errorMessage={"At least one facility must be selected"}
      disabled={disabled}
    />
  );
};

export default UserFacilitiesSettings;
