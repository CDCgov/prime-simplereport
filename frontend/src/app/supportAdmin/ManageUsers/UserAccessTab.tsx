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
import { displayFullName } from "../../utils";

type UserAccessFormData = {
  organizationId: string;
  role: Role;
  facilityIds: string[];
};

export interface UserAccessTabProps {
  user: User;
  isUpdating: boolean;
}

// Set the prompt warning of moving away from the component in manage user component
// Move all the react-hook-form logic to manage user component so the form is not lost when changing tabs
// Make sure the latest user information is retrieve after this update takes effect.
const UserAccessTab: React.FC<UserAccessTabProps> = ({ user }) => {
  // retrieve organizations
  // retrieve facilities by org
  // set the defaults based on what the user has

  // maybe adding the prompt when a user triggers a new search?

  const getDefaultFacilities = () => {
    const facilityIds: string[] = [];

    if (user.role === "ADMIN") {
      facilityIds.push("ALL_FACILITIES");
    }

    return facilityIds.concat(
      user.organization?.testingFacility.map((facility) => facility.id) || []
    );
  };
  /**
   * Form state setup
   */
  const {
    control,
    handleSubmit,
    formState: { errors, dirtyFields },
    watch,
    register,
    reset,
    setValue,
  } = useForm<UserAccessFormData>({
    defaultValues: {
      organizationId: user.organization?.id || "",
      facilityIds: getDefaultFacilities(),
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
  const [updateUserPrivilegesAndGroupAccess, { loading: updatingPrivileges }] =
    useUpdateUserPrivilegesAndGroupAccessMutation();
  const onSubmit = async (userAccessData: UserAccessFormData) => {
    const allFacilityAccess = !!userAccessData.facilityIds.find(
      (id) => id === "ALL_FACILITIES"
    );

    await updateUserPrivilegesAndGroupAccess({
      variables: {
        username: user.email,
        role: userAccessData.role as MutationRole,
        orgExternalId: facilitiesResponse?.organization?.externalId || "",
        accessAllFacilities: allFacilityAccess,
        facilities: userAccessData.facilityIds.filter(
          (id) => id !== "ALL_FACILITIES"
        ),
      },
    });

    const fullName = displayFullName(
      user?.firstName,
      user?.middleName,
      user?.lastName
    );

    showSuccess("", `Access updated for ${fullName}`);
    reset(userAccessData);
  };

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
        <Button
          className={"margin-y-4"}
          variant="outline"
          type="submit"
          label={"Save changes"}
          disabled={!isDirtyAlt || updatingPrivileges}
        />
      </form>
    </div>
  );
};

export default UserAccessTab;
