import React from "react";
import { FieldError } from "react-hook-form/dist/types/errors";
import { UseFormSetValue } from "react-hook-form";
import { UseFormGetValues } from "react-hook-form/dist/types/form";

import Button from "../../commonComponents/Button/Button";
import UserFacilitiesSettings from "../../Settings/Users/UserFacilitiesSettings";
import { User, Facility } from "../../../generated/graphql";
import UserOrganizationFormField from "../../commonComponents/UserDetails/UserOrganizationFormField";
import UserRoleFormField from "../../commonComponents/UserDetails/UserRoleFormField";

export interface UserAccessTabProps {
  user: User;
  onSubmit: () => Promise<void>;
  setValue: UseFormSetValue<any>;
  getValues: UseFormGetValues<any>;
  control: any;
  register: any;
  errors: any;
  isDirty: boolean;
  isLoadingFacilities: boolean;
  isSubmitting: boolean;
  facilityList: Pick<Facility, "id" | "name">[];
}

// Set the prompt warning of moving away from the component in manage user component
// Move all the react-hook-form logic to manage user component so the form is not lost when changing tabs
// Make sure the latest user information is retrieve after this update takes effect.
const UserAccessTab: React.FC<UserAccessTabProps> = ({
  user,
  facilityList,
  setValue,
  onSubmit,
  control,
  getValues,
  register,
  errors,
  isDirty,
  isLoadingFacilities,
  isSubmitting,
}) => {
  const selectedRole = getValues("role");

  /**
   * Confirmation modal
   */

  /**
   * HTML
   */
  return (
    <div
      role="tabpanel"
      aria-labelledby={"organization-access-tab-id"}
      className="padding-left-1"
    >
      <form
        onSubmit={onSubmit}
        className="usa-form usa-form--large manage-user-form__site-admin"
      >
        <UserOrganizationFormField control={control} />
        <UserRoleFormField
          value={selectedRole}
          registrationProps={register("role", { required: "Role is required" })}
          error={errors.role}
        />
        <UserFacilitiesSettings
          roleSelected={selectedRole}
          facilityList={facilityList || []}
          register={register}
          error={errors.facilityIds as FieldError}
          setValue={setValue}
          disabled={isLoadingFacilities || selectedRole === "ADMIN"}
        />
        <Button
          className={"margin-y-4"}
          variant="outline"
          type="submit"
          label={"Save changes"}
          disabled={!isDirty || isSubmitting}
        />
      </form>
    </div>
  );
};

export default UserAccessTab;
