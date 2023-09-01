import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FieldError } from "react-hook-form/dist/types/errors";

import Button from "../../commonComponents/Button/Button";
import { UserFacilitySetting } from "../../Settings/Users/ManageUsersContainer";
import UserFacilitiesSettings from "../../Settings/Users/UserFacilitiesSettings";
import {
  useGetFacilitiesByOrgIdLazyQuery,
  User,
  useUpdateUserPrivilegesAndGroupAccessMutation,
  Role as MutationRole,
} from "../../../generated/graphql";
import UserOrganizationFormField from "../../commonComponents/UserDetails/UserOrganizationFormField";
import UserRoleFormField from "../../commonComponents/UserDetails/UserRoleFormField";
import { Role } from "../../permissions";
import { showSuccess } from "../../utils/srToast";

/*
* username: String!,
    orgExternalId: String!,
    accessAllFacilities: Boolean = false,
    facilities: [ID] = [],
    role: Role!): User!*/

//MutationUpdateUserPrivilegesAndGroupAccessArgs
type UserAccessFormData = {
  organizationId: string;
  role: Role;
  facilityIds: string[];
};

export interface UserAccessTabProps {
  user: User;
  isUpdating: boolean;
}

// set the form with react hook forms
// set the prompt warning of moving away from the component
// can the DOM be split? but each element need to be compatible
// with react hook forms
// the container is the one that has the logic to call the right mutation
//
const UserAccessTab: React.FC<UserAccessTabProps> = ({ user }) => {
  // retrieve organizations
  // retrieve facilities by org
  // set the defaults based on what the user has

  // maybe adding the prompt when a user triggers a new search?

  /**
   * Form state setup
   */
  const {
    control,
    handleSubmit,
    formState: { errors, dirtyFields },
    watch,
    register,
    setValue,
  } = useForm<UserAccessFormData>({
    defaultValues: {
      organizationId: user.organization?.id || "",
      facilityIds:
        user.organization?.testingFacility.map((facility) => facility.id) || [],
      role: user.role || "USER",
    },
  });

  // ToDo revisting why this is needed here but no in create user
  const isDirtyAlt = !!Object.keys(dirtyFields).length;

  const formCurrentValues = watch();

  /**
   * Fetch facilities
   */
  const [
    queryGetFacilitiesByOrgId,
    { data: facilitiesResponse, loading: loadingFacilities },
  ] = useGetFacilitiesByOrgIdLazyQuery();

  useEffect(() => {
    if (formCurrentValues.organizationId) {
      queryGetFacilitiesByOrgId({
        fetchPolicy: "no-cache",
        variables: {
          orgId: formCurrentValues.organizationId,
        },
      });
    }
  }, [queryGetFacilitiesByOrgId, formCurrentValues.organizationId]);

  const facilityList = formCurrentValues.organizationId
    ? facilitiesResponse?.organization?.facilities.map(
        (facility) =>
          ({ id: facility.id, name: facility.name } as UserFacilitySetting)
      )
    : [];
  /**
   * Submit access updates
   */

  const [updateUserPrivilegesAndGroupAccess] =
    useUpdateUserPrivilegesAndGroupAccessMutation();
  const onSubmit = async (userAccessData: UserAccessFormData) => {
    console.log("submitting data", userAccessData);
    await updateUserPrivilegesAndGroupAccess({
      variables: {
        username: user.email,
        role: userAccessData.role as MutationRole,
        orgExternalId: userAccessData.organizationId,
        accessAllFacilities: false,
        facilities: userAccessData.facilityIds,
      },
    });
    showSuccess("User updated", "hooray");
    // I might need to convert the orgID to externalOrgId before pushing for the update
  };
  console.log("dirty fields: ", isDirtyAlt, dirtyFields);
  return (
    <div
      role="tabpanel"
      aria-labelledby={"organization-access-tab-id"}
      className="padding-left-1"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="usa-form usa-form--large manage-user-form__site-admin"
      >
        <UserOrganizationFormField control={control} />
        <UserRoleFormField
          value={formCurrentValues.role}
          registrationProps={register("role", { required: "Role is required" })}
          error={errors.role}
        />
        <UserFacilitiesSettings
          roleSelected={formCurrentValues.role}
          allFacilities={facilityList || []}
          register={register}
          error={errors.facilityIds as FieldError}
          setValue={setValue}
          disabled={loadingFacilities}
        />
        <Button type="submit" label="Save changes" disabled={!isDirtyAlt} />
      </form>
    </div>
  );
};

export default UserAccessTab;
