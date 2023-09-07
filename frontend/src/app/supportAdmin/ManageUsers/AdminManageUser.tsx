import React, { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import classNames from "classnames";

import { useDocumentTitle } from "../../utils/hooks";
import {
  useEditUserEmailMutation,
  useFindUserByEmailLazyQuery,
  useReactivateUserAndResetPasswordMutation,
  useResendActivationEmailMutation,
  useResetUserMfaMutation,
  useResetUserPasswordMutation,
  useSetUserIsDeletedMutation,
  useUpdateUserNameMutation,
  useUndeleteUserMutation,
  User,
  useUpdateUserPrivilegesAndGroupAccessMutation,
  Role as MutationRole,
  useGetFacilitiesByOrgIdLazyQuery,
} from "../../../generated/graphql";
import Prompt from "../../utils/Prompt";
import { showSuccess } from "../../utils/srToast";
import { isUserActive } from "../../Settings/Users/UserDetailUtils";
import { displayFullName } from "../../utils";
import { OktaUserStatus } from "../../utils/user";
import UserInfoTab from "../../Settings/Users/UserInfoTab";
import UserHeading from "../../commonComponents/UserDetails/UserHeading";
import { UserFacilitySetting } from "../../Settings/Users/ManageUsersContainer";

import UserAccessTab from "./UserAccessTab";
import { UserSearch } from "./UserSearch";
import UnsavedChangesModal from "./UnsaveChangesModal";

export interface UserAccessFormData {
  organizationId: string;
  role: string;
  facilityIds: string[];
}

export interface UserSearchState {
  searchEmail: string;
  foundUser: User | undefined;
  displayedError: JSX.Element | undefined;
}

export const initialState: UserSearchState = {
  searchEmail: "",
  foundUser: undefined,
  displayedError: undefined,
};

const userNotFoundError = (
  <div className={"padding-x-3 padding-bottom-205"}>
    <h2>User not found</h2>
    Please check the email address and try the search again, or contact the
    SimpleReport team for help.
  </div>
);

const userIdentityError = (
  <div className={"padding-x-3 padding-bottom-205"}>
    <h2>Can't determine user identity</h2>
    The email address isn't in Okta and can't be displayed. Please escalate the
    issue to the SimpleReport team.
  </div>
);

const genericError = (
  <div className={"padding-x-3 padding-bottom-205"}>
    <h2>Something went wrong</h2>
    Please try again or contact the SimpleReport team for help.
  </div>
);

export const AdminManageUser: React.FC = () => {
  useDocumentTitle("Manage Users");
  const [{ searchEmail, foundUser, displayedError }, setSearchState] =
    useState<UserSearchState>(initialState);
  const [navItemSelected, setNavItemSelected] = useState<
    "User information" | "User access"
  >("User information");
  const [getUserByEmail] = useFindUserByEmailLazyQuery({
    fetchPolicy: "no-cache",
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateUserName] = useUpdateUserNameMutation();
  const [updateUserEmail] = useEditUserEmailMutation();
  const [resetPassword] = useResetUserPasswordMutation();
  const [resetMfa] = useResetUserMfaMutation();
  const [deleteUser] = useSetUserIsDeletedMutation();
  const [reactivateUserAndResetPassword] =
    useReactivateUserAndResetPasswordMutation();
  const [resendUserActivationEmail] = useResendActivationEmailMutation();
  const [undeleteUser] = useUndeleteUserMutation();

  const userFullName = displayFullName(
    foundUser?.firstName,
    foundUser?.middleName,
    foundUser?.lastName
  );

  /**
   * User information handlers
   */
  const handleUpdate = async (func: () => Promise<void>) => {
    setIsUpdating(true);
    try {
      await func();
    } finally {
      setIsUpdating(false);
    }
  };
  const handleEditUserName = async (
    userId: string,
    firstName: string,
    middleName: string,
    lastName: string,
    suffix: string
  ) => {
    await handleUpdate(async () => {
      await updateUserName({
        variables: {
          id: userId,
          firstName: firstName,
          middleName: middleName,
          lastName: lastName,
          suffix: suffix,
        },
      });

      setSearchState((prevState) => ({
        ...prevState,
        foundUser: {
          ...prevState.foundUser,
          firstName,
          middleName,
          lastName,
          suffix,
        } as User,
      }));

      const fullName = displayFullName(firstName, "", lastName);
      showSuccess("", `User name changed to ${fullName}`);
    });
  };
  const handleEditUserEmail = async (userId: string, emailAddress: string) => {
    await handleUpdate(async () => {
      await updateUserEmail({
        variables: {
          id: userId,
          email: emailAddress,
        },
      });
      showSuccess("", `User email address changed to ${emailAddress}`);
      setSearchState((prevState) => ({
        ...prevState,
        foundUser: {
          ...prevState.foundUser,
          email: emailAddress,
        } as User,
      }));
    });
  };
  const handleResetUserPassword = async (userId: string) => {
    await handleUpdate(async () => {
      await resetPassword({
        variables: {
          id: userId,
        },
      });

      showSuccess("", `Password reset for ${userFullName}`);
    });
  };
  const handleResetUserMfa = async (userId: string) => {
    await handleUpdate(async () => {
      await resetMfa({
        variables: {
          id: userId,
        },
      });

      showSuccess("", `MFA reset for ${userFullName}`);
    });
  };
  const handleDeleteUser = async (userId: string) => {
    await handleUpdate(async () => {
      await deleteUser({
        variables: {
          id: userId,
          deleted: true,
        },
      });

      setSearchState((prevState) => ({
        ...prevState,
        foundUser: {
          ...prevState.foundUser,
          isDeleted: true,
          status: OktaUserStatus.SUSPENDED,
        } as User,
      }));

      showSuccess("", `User account removed for ${userFullName}`);
    });
  };
  const handleReactivateUser = async (userId: string) => {
    await handleUpdate(async () => {
      await reactivateUserAndResetPassword({
        variables: {
          id: userId,
        },
      });

      setSearchState((prevState) => ({
        ...prevState,
        foundUser: {
          ...prevState.foundUser,
          status: OktaUserStatus.ACTIVE,
        } as User,
      }));

      showSuccess("", `${userFullName} has been reactivated.`);
    });
  };
  const handleResendUserActivationEmail = async (userId: string) => {
    await handleUpdate(async () => {
      await resendUserActivationEmail({
        variables: {
          id: userId,
        },
      });

      showSuccess("", `${userFullName} has been sent a new invitation.`);
    });
  };

  const handleUndeleteUser = async () => {
    await handleUpdate(async () => {
      await undeleteUser({
        variables: { userId: foundUser?.id as string },
      });

      await retrieveUser();

      showSuccess("", `User account undeleted for ${userFullName}`);
    });
  };

  const retrieveUser = async () => {
    return getUserByEmail({ variables: { email: searchEmail.trim() } }).then(
      ({ data, error }) => {
        if (!data?.user && !error) {
          setSearchState((prevState) => ({
            ...prevState,
            displayedError: userNotFoundError,
            foundUser: undefined,
          }));
        } else if (
          error?.message ===
          "header: Error finding user email; body: Please escalate this issue to the SimpleReport team."
        ) {
          setSearchState((prevState) => ({
            ...prevState,
            displayedError: userIdentityError,
            foundUser: undefined,
          }));
        } else if (error) {
          setSearchState((prevState) => ({
            ...prevState,
            displayedError: genericError,
            foundUser: undefined,
          }));
        } else {
          reset({
            role: data?.user?.role || "USER",
            organizationId: data?.user?.organization?.id,
            facilityIds:
              data?.user?.organization?.testingFacility.map(
                (facility) => facility.id
              ) || [],
          });

          setSearchState((prevState) => ({
            ...prevState,
            displayedError: undefined,
            foundUser: data?.user as User,
          }));
        }
      }
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchState((prevState) => ({
      ...prevState,
      searchEmail: e.target.value,
    }));
  };
  const handleClearFilter = () => {
    setSearchState(initialState);
  };

  const handleSearch = () => {
    retrieveUser();
  };

  /**
   * User access form setup
   */
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    register,
    reset,
    setValue,
  } = useForm<UserAccessFormData>();

  const formValues = useWatch({
    control,
    defaultValue: {
      organizationId: "",
      role: "USER",
      facilityIds: [],
    },
  });

  /**
   * Fetch facilities
   */
  const [
    queryGetFacilitiesByOrgId,
    { data: facilitiesResponse, loading: loadingFacilities },
  ] = useGetFacilitiesByOrgIdLazyQuery();

  useEffect(() => {
    if (formValues.organizationId) {
      queryGetFacilitiesByOrgId({
        fetchPolicy: "no-cache",
        variables: {
          orgId: formValues.organizationId,
        },
      });

      if (formValues.organizationId !== foundUser?.organization?.id) {
        setValue("facilityIds", []);
      }
    }
  }, [
    queryGetFacilitiesByOrgId,
    formValues.organizationId,
    setValue,
    foundUser?.organization?.id,
  ]);

  const facilityList = formValues.organizationId
    ? facilitiesResponse?.organization?.facilities.map(
        (facility) =>
          ({ id: facility.id, name: facility.name } as UserFacilitySetting)
      )
    : [];

  /**
   * Submit access updates
   */
  const [updateUserPrivilegesAndGroupAccess, { loading: isUpdatingAccess }] =
    useUpdateUserPrivilegesAndGroupAccessMutation();

  const updateUserPrivileges = async (userAccessData: UserAccessFormData) => {
    const allFacilityAccess =
      userAccessData.role === "ADMIN" ||
      !!userAccessData.facilityIds.find((id) => id === "ALL_FACILITIES");

    await updateUserPrivilegesAndGroupAccess({
      variables: {
        username: foundUser?.email || "",
        role: userAccessData.role as MutationRole,
        orgExternalId: facilitiesResponse?.organization?.externalId || "",
        accessAllFacilities: allFacilityAccess,
        facilities: allFacilityAccess
          ? []
          : userAccessData.facilityIds?.filter((id) => id !== "ALL_FACILITIES"),
      },
    });

    showSuccess("", `Access updated for ${userFullName}`);
    await retrieveUser();
  };

  /**
   * Unsaved changes (prompt and in-progress modal)
   */
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const operationType = useRef<"CLEAR" | "SEARCH">("CLEAR");
  const handleWithInProgressCheck = (
    operation: typeof operationType.current,
    operationMethod: Function
  ) => {
    if (isDirty) {
      operationType.current = operation;
      setShowUnsavedWarning(true);
    } else {
      operationMethod();
    }
  };

  /**
   * Tab content
   */
  const tabs: (typeof navItemSelected)[] = ["User information", "User access"];

  /**
   * HTML
   */
  return (
    <div className="prime-home flex-1">
      <div className="grid-container">
        <UserSearch
          onClearFilter={() =>
            handleWithInProgressCheck("CLEAR", handleClearFilter)
          }
          onSearchClick={(e) => {
            e.preventDefault();
            handleWithInProgressCheck("SEARCH", handleSearch);
          }}
          onInputChange={handleInputChange}
          searchEmail={searchEmail}
          disableClearFilters={!searchEmail && !foundUser && !displayedError}
        />
        {displayedError && (
          <div
            className={classNames("prime-container", "card-container")}
            aria-live={"polite"}
          >
            {displayedError}
          </div>
        )}
        {foundUser && (
          <div
            className={classNames(
              "prime-container",
              "card-container",
              "manage-users-card"
            )}
            aria-live={"polite"}
          >
            <div className="usa-card__body">
              <div className="tablet:grid-col padding-left-3 user-detail-column">
                <UserHeading
                  user={foundUser}
                  isUpdating={isUpdating}
                  onResendUserActivationEmail={handleResendUserActivationEmail}
                  onReactivateUser={handleReactivateUser}
                  onUndeleteUser={handleUndeleteUser}
                />
                <nav
                  className="prime-secondary-nav margin-top-4 padding-bottom-0"
                  aria-label="Manage user navigation"
                >
                  <div
                    role="tablist"
                    aria-owns="userinformation-tab useraccess-tab"
                    className="usa-nav__secondary-links prime-nav usa-list"
                  >
                    {tabs.map((tabLabel) => (
                      <div
                        key={tabLabel}
                        className={`usa-nav__secondary-item ${
                          navItemSelected === tabLabel ? "usa-current" : ""
                        }`}
                      >
                        <button
                          id={`${tabLabel
                            .toLowerCase()
                            .replaceAll(" ", "")}-tab`}
                          role="tab"
                          className="usa-button--unstyled text-ink text-no-underline cursor-pointer"
                          onClick={() => setNavItemSelected(tabLabel)}
                          aria-selected={navItemSelected === tabLabel}
                        >
                          {tabLabel}
                        </button>
                      </div>
                    ))}
                  </div>
                </nav>
                {navItemSelected === "User information" ? (
                  <UserInfoTab
                    user={foundUser}
                    isUserActive={isUserActive(foundUser)}
                    isUpdating={isUpdating}
                    onEditUserName={handleEditUserName}
                    onEditUserEmail={handleEditUserEmail}
                    onResetUserPassword={handleResetUserPassword}
                    onResetUserMfa={handleResetUserMfa}
                    onDeleteUser={handleDeleteUser}
                  />
                ) : (
                  <UserAccessTab
                    user={foundUser}
                    onSubmit={updateUserPrivileges}
                    handleSubmit={handleSubmit}
                    formValues={formValues as UserAccessFormData}
                    control={control}
                    errors={errors}
                    isDirty={isDirty}
                    register={register}
                    setValue={setValue}
                    facilityList={facilityList || []}
                    isLoadingFacilities={loadingFacilities}
                    isSubmitting={isUpdatingAccess}
                  />
                )}
              </div>
              <Prompt
                when={isDirty}
                message="You have unsaved changes if the user access tab. Do you want to leave the page?"
              />
              <UnsavedChangesModal
                closeModal={() => setShowUnsavedWarning(false)}
                isShowing={showUnsavedWarning}
                onContinue={() => {
                  setShowUnsavedWarning(false);
                  operationType.current === "CLEAR"
                    ? handleClearFilter()
                    : handleSearch();
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
