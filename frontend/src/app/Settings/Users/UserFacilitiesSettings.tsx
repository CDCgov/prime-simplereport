import React from "react";
import { UseFormRegister, UseFormSetValue } from "react-hook-form";
import { FieldError } from "react-hook-form/dist/types/errors";

import Checkboxes from "../../commonComponents/Checkboxes";

import { UserFacilitySetting } from "./ManageUsersContainer";
import "./ManageUsers.scss";
import { alphabeticalFacilitySort } from "./UserFacilitiesSettingsForm";

interface UserFacilitiesSettingProps {
  roleSelected: string;
  allFacilities: UserFacilitySetting[];
  register: UseFormRegister<any>;
  error?: FieldError;
  setValue: UseFormSetValue<any>;
  disabled?: boolean;
}

// This is the react-hook-form supported version of UserFacilitiesSettingsForm.
const UserFacilitiesSettings: React.FC<UserFacilitiesSettingProps> = ({
  roleSelected,
  allFacilities,
  register,
  error,
  setValue,
  disabled,
}) => {
  const isAdmin = roleSelected === "ADMIN";
  const facilityAccessDescription = isAdmin
    ? "Admins have access to all facilities"
    : "All users must have access to at least one facility";
  allFacilities.sort(alphabeticalFacilitySort);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    if (value === "ALL_FACILITIES" && checked && setValue) {
      setValue("facilityIds", [
        "ALL_FACILITIES",
        ...allFacilities.map((facility) => facility.id),
      ]);
    }
  };

  let boxes = [
    {
      value: "ALL_FACILITIES",
      label: `Access all facilities (${allFacilities.length})`,
      ...register("facilityIds", {
        required: "At least one facility must be selected",
        disabled: isAdmin,
        onChange,
      }),
    },
    ...allFacilities.map((facility) => ({
      value: facility.id,
      label: facility.name,
      ...register("facilityIds", {
        required: "At least one facility must be selected",
        disabled: isAdmin,
        onChange,
      }),
    })),
  ];

  return (
    <Checkboxes
      boxes={boxes}
      legend="Facilities access"
      hintText={facilityAccessDescription}
      name="facilities"
      required
      onChange={onChange}
      validationStatus={error?.type ? "error" : undefined}
      errorMessage={error?.message}
      disabled={disabled}
    />
  );
};

export default UserFacilitiesSettings;
