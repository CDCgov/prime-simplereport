import React from "react";
import { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";

import Checkboxes from "../../commonComponents/Checkboxes";
import Required from "../../commonComponents/Required";

import { UserFacilitySetting } from "./ManageUsersContainer";
import "./ManageUsers.scss";
import { CreateUser } from "./CreateUserSchema";
import { alphabeticalFacilitySort } from "./UserFacilitiesSettingsForm";

interface UserFacilitiesSettingProps {
  formValues: CreateUser;
  allFacilities: UserFacilitySetting[];
  register: UseFormRegister<CreateUser>;
  errors: FieldErrors<CreateUser>;
  setValue: UseFormSetValue<CreateUser>;
}

// This is the react-hook-form supported version of UserFacilitiesSettingsForm.
const UserFacilitiesSettings: React.FC<UserFacilitiesSettingProps> = ({
  formValues,
  allFacilities,
  register,
  errors,
  setValue,
}) => {
  const isAdmin = formValues.role === "ADMIN";
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
    <>
      <h4 className="testing-facility-access-subheader margin-bottom-0">
        <Required label={"Testing facility access"} />
      </h4>
      <p className="testing-facility-access-subtext">
        {facilityAccessDescription}
      </p>
      <Checkboxes
        boxes={boxes}
        legend="Facilities"
        legendSrOnly
        name="facilities"
        onChange={onChange}
        validationStatus={errors?.facilityIds?.type ? "error" : undefined}
        errorMessage={errors?.facilityIds?.message}
      />
    </>
  );
};

export default UserFacilitiesSettings;
