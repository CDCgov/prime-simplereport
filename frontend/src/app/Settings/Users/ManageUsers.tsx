import React, { useEffect, useState } from "react";
import { ApolloQueryResult } from "@apollo/client";

import Button from "../../commonComponents/Button/Button";
import { displayFullName } from "../../utils";
import { showSuccess } from "../../utils/srToast";
import reload from "../../utils/reload";
import {
  GetUsersAndStatusQuery,
  useGetUserLazyQuery,
  UserPermission,
} from "../../../generated/graphql";

import CreateUserModal from "./CreateUserModal";
import UsersSideNav from "./UsersSideNav";
import { isUserActive, isUserSelf, UserHeading } from "./UserDetailUtils";
import {
  LimitedUser,
  SettingsUser,
  UserFacilitySetting,
} from "./ManageUsersContainer";
import "./ManageUsers.scss";
import InProgressModal from "./InProgressModal";
import UserInfoTab from "./UserInfoTab";
import FacilityAccessTab from "./FacilityAccessTab";

interface Props {
  users: LimitedUser[];
  loggedInUser: User;
  allFacilities: UserFacilitySetting[];
  updateUserPrivileges: (variables: any) => Promise<any>;
  addUserToOrg: (variables: any) => Promise<any>;
  updateUserName: (variables: any) => Promise<any>;
  updateUserEmail: (variables: any) => Promise<any>;
  resetUserPassword: (variables: any) => Promise<any>;
  resetUserMfa: (variables: any) => Promise<any>;
  deleteUser: (variables: any) => Promise<any>;
  reactivateUser: (variables: any) => Promise<any>;
  resendUserActivationEmail: (variables: any) => Promise<any>;
  getUsers: () => Promise<ApolloQueryResult<GetUsersAndStatusQuery>>;
}

export type LimitedUsers = { [id: string]: LimitedUser };

export type SettingsUsers = { [id: string]: SettingsUser };

export type UpdateUser = <K extends keyof SettingsUser>(
  key: K,
  value: SettingsUser[K]
) => void;

const emptySettingsUser: SettingsUser = {
  firstName: "",
  middleName: "",
  lastName: "",
  suffix: "",
  id: "",
  email: "",
  status: "",
  organization: { testingFacility: [] },
  permissions: [],
  roleDescription: "user",
  role: "USER",
};

const sortUsers = (users: LimitedUsers) =>
  Object.values(users).sort((a, b) => {
    const nameA = displayFullName(a.firstName, a.middleName, a.lastName);
    const nameB = displayFullName(b.firstName, b.middleName, b.lastName);
    if (nameA === nameB) return 0;
    return nameA > nameB ? 1 : -1;
  });

const getLimitedUser = (users: LimitedUser[]) =>
  users.reduce((acc: LimitedUsers, user: LimitedUser) => {
    acc[user.id] = user;
    return acc;
  }, {});

const ManageUsers: React.FC<Props> = ({
  users,
  loggedInUser,
  allFacilities,
  updateUserPrivileges,
  addUserToOrg,
  updateUserName,
  updateUserEmail,
  resetUserPassword,
  resetUserMfa,
  deleteUser,
  reactivateUser,
  resendUserActivationEmail,
  getUsers,
}) => {
  const [userWithPermissions, updateUserWithPermissions] =
    useState<SettingsUser | null>();

  const [nextActiveUserId, updateNextActiveUserId] = useState<string | null>(
    null
  );
  const [showInProgressModal, updateShowInProgressModal] = useState(false);
  const [showAddUserModal, updateShowAddUserModal] = useState(false);
  const [isUserEdited, updateIsUserEdited] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error>();
  const [navItemSelected, setNavItemSelected] = useState<
    "User information" | "Facility access"
  >("User information");
  if (error) {
    throw error;
  }

  /**
   * Load data for the selected user
   */
  // Local users will be more up-to-date than users, which only gets updated after server requests complete
  let localUsers = [...users];
  const usersState: LimitedUsers = getLimitedUser(localUsers);
  const sortedUsers = sortUsers(usersState);
  const [activeUser, updateActiveUser] = useState<LimitedUser>(
    sortedUsers?.[0]
  );

  const [queryUserWithPermissions] = useGetUserLazyQuery({
    variables: { id: activeUser ? activeUser.id : loggedInUser.id },
    fetchPolicy: "no-cache",
    onCompleted: (data) => updateUserWithPermissions(data.user),
  });

  useEffect(() => {
    queryUserWithPermissions();
  }, [activeUser, queryUserWithPermissions]);

  // only updates the local state
  const updateLocalUserState: UpdateUser = (key, value) => {
    if (activeUser && userWithPermissions) {
      updateUserWithPermissions({
        ...userWithPermissions,
        [key]: value,
      });
      updateIsUserEdited(true);
    }
  };

  /**
   * Event Handlers
   */
  // confirm with the user if they have unsaved edits and want to change users
  const onChangeActiveUser = (nextActiveUserId: string) => {
    if (isUserEdited) {
      updateNextActiveUserId(nextActiveUserId);
      updateShowInProgressModal(true);
    } else {
      updateActiveUser(usersState[nextActiveUserId]); // this update will trigger the effect that performs the query
    }
  };

  // proceed with changing the active user
  const handleContinueChangeActiveUser = () => {
    updateIsUserEdited(false);
    updateShowInProgressModal(false);
    if (nextActiveUserId) {
      updateActiveUser(usersState[nextActiveUserId]);
    }
  };

  const handleUpdateUser = () => {
    if (!activeUser) {
      return;
    }
    setIsUpdating(true);
    updateUserPrivileges({
      variables: {
        id: userWithPermissions?.id,
        role: userWithPermissions?.role,
        facilities: userWithPermissions?.organization?.testingFacility.map(
          ({ id }) => id
        ),
        accessAllFacilities: userWithPermissions?.permissions.includes(
          UserPermission.AccessAllFacilities
        ),
      },
    })
      .then(async () => {
        await getUsers();
        updateIsUserEdited(false);
        const fullName = displayFullName(
          userWithPermissions?.firstName,
          userWithPermissions?.middleName,
          userWithPermissions?.lastName
        );
        setIsUpdating(false);
        showSuccess(`${fullName}'s settings have been saved`, "Changes Saved");
      })
      .catch(setError);
  };

  const handleAddUserToOrg = async (newUserInvite: Partial<SettingsUser>) => {
    try {
      setIsUpdating(true);
      const {
        firstName,
        lastName,
        email,
        role = "USER",
        organization,
        permissions,
      } = newUserInvite;
      const { data } = await addUserToOrg({
        variables: {
          firstName,
          lastName,
          email,
          role,
          facilities: organization?.testingFacility.map(({ id }) => id) ?? [],
          accessAllFacilities:
            permissions?.includes(UserPermission.AccessAllFacilities) ?? false,
        },
      });
      const addedUser = data?.addUserToCurrentOrg?.id;
      if (!addedUser) {
        throw new Error("Error adding user");
      }

      const fullName = displayFullName(firstName, "", lastName);

      await getUsers();
      updateActiveUser({
        ...newUserInvite,
        id: addedUser,
      } as LimitedUser);

      showSuccess(
        "They will receive an invitation to create an account at the email address provided",
        `Invitation sent to ${fullName}`
      );
      updateShowAddUserModal(false);

      setIsUpdating(false);
    } catch (e: any) {
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
    try {
      await updateUserName({
        variables: {
          id: userId,
          firstName: firstName,
          middleName: middleName,
          lastName: lastName,
          suffix: suffix,
        },
      });
      const fullName = displayFullName(firstName, "", lastName);
      showSuccess("", `User name changed to ${fullName}`);
      await queryUserWithPermissions();
    } catch (e: any) {
      setError(e);
    }
  };

  const handleEditUserEmail = async (userId: string, emailAddress: string) => {
    try {
      await updateUserEmail({
        variables: {
          id: userId,
          email: emailAddress,
        },
      });
      showSuccess("", `User email address changed to ${emailAddress}`);
      await queryUserWithPermissions();
      await getUsers();
    } catch (e: any) {}
  };

  const handleResetUserPassword = async (userId: string) => {
    try {
      await resetUserPassword({
        variables: {
          id: userId,
        },
      });
      const fullName = displayFullName(
        userWithPermissions?.firstName,
        userWithPermissions?.middleName,
        userWithPermissions?.lastName
      );
      showSuccess("", `Password reset for ${fullName}`);
    } catch (e: any) {
      setError(e);
    }
  };

  const handleResetUserMfa = async (userId: string) => {
    try {
      await resetUserMfa({
        variables: {
          id: userId,
        },
      });
      const fullName = displayFullName(
        userWithPermissions?.firstName,
        userWithPermissions?.middleName,
        userWithPermissions?.lastName
      );
      showSuccess("", `MFA reset for ${fullName}`);
    } catch (e: any) {
      setError(e);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser({
        variables: {
          id: userId,
          deleted: true,
        },
      });
      const fullName = displayFullName(
        userWithPermissions?.firstName,
        userWithPermissions?.middleName,
        userWithPermissions?.lastName
      );

      const nextUser: LimitedUser =
        sortedUsers[0].id === userId && sortedUsers.length > 1
          ? sortedUsers[1]
          : sortedUsers[0];

      await getUsers();
      updateActiveUser(nextUser);
      showSuccess("", `User account removed for ${fullName}`);
    } catch (e: any) {
      setError(e);
    }
  };

  const handleReactivateUser = async (userId: string) => {
    try {
      await reactivateUser({
        variables: {
          id: userId,
        },
      });
      const fullName = displayFullName(
        userWithPermissions?.firstName,
        userWithPermissions?.middleName,
        userWithPermissions?.lastName
      );
      reload();
      showSuccess("", `${fullName} has been reactivated.`);
    } catch (e: any) {
      setError(e);
    }
  };

  const handleResendUserActivationEmail = async (userId: string) => {
    try {
      await resendUserActivationEmail({
        variables: {
          id: userId,
        },
      });
      const fullName = displayFullName(
        userWithPermissions?.firstName,
        userWithPermissions?.middleName,
        userWithPermissions?.lastName
      );
      showSuccess("", `${fullName} has been sent a new invitation.`);
    } catch (e: any) {
      setError(e);
    }
  };

  const user: SettingsUser = userWithPermissions ?? emptySettingsUser;

  /**
   * HTML
   */
  return (
    <div className="prime-container card-container manage-users-card">
      <div className="usa-card__header">
        <h1>Manage users</h1>
        <Button
          onClick={() => updateShowAddUserModal(true)}
          label="+ Add user"
        />
      </div>
      {showAddUserModal ? (
        <CreateUserModal
          onClose={() => updateShowAddUserModal(false)}
          onSubmit={handleAddUserToOrg}
          isUpdating={isUpdating}
        />
      ) : null}
      {!activeUser || !localUsers.length ? (
        <div className="usa-card__body">
          {!localUsers.length ? (
            <p>There are no users in this organization</p>
          ) : (
            <p>Loading user data</p>
          )}
        </div>
      ) : (
        <div className="usa-card__body">
          <div className="grid-row">
            <UsersSideNav
              activeUserId={activeUser.id || ""}
              users={sortedUsers}
              onChangeActiveUser={onChangeActiveUser}
            />
            <div
              role="tabpanel"
              aria-labelledby={"user-tab-" + user?.id}
              className="tablet:grid-col padding-left-3 user-detail-column"
            >
              <UserHeading
                user={user}
                isUserSelf={isUserSelf(user, loggedInUser)}
                isUpdating={isUpdating}
                handleResendUserActivationEmail={
                  handleResendUserActivationEmail
                }
                handleReactivateUser={handleReactivateUser}
              />
              <nav
                className="prime-secondary-nav margin-top-4 padding-bottom-0"
                aria-label="User action navigation"
              >
                <div
                  role="tablist"
                  aria-owns={`user-information-tab-id facility-access-tab-id`}
                  className="usa-nav__secondary-links prime-nav usa-list"
                >
                  <div
                    className={`usa-nav__secondary-item ${
                      navItemSelected === "User information"
                        ? "usa-current"
                        : ""
                    }`}
                  >
                    <button
                      id={`user-information-tab-id`}
                      role="tab"
                      className="usa-button--unstyled text-ink text-no-underline"
                      onClick={() => setNavItemSelected("User information")}
                      aria-selected={navItemSelected === "User information"}
                    >
                      User information
                    </button>
                  </div>
                  <div
                    className={`usa-nav__secondary-item ${
                      navItemSelected === "Facility access" ? "usa-current" : ""
                    }`}
                  >
                    <button
                      id={`facility-access-tab-id`}
                      role="tab"
                      className="usa-button--unstyled text-ink text-no-underline"
                      onClick={() => setNavItemSelected("Facility access")}
                      aria-selected={navItemSelected === "Facility access"}
                    >
                      Facility access
                    </button>
                  </div>
                </div>
              </nav>
              {navItemSelected === "User information" ? (
                <UserInfoTab
                  user={user}
                  isUserActive={isUserActive(user)}
                  isUserSelf={isUserSelf(user, loggedInUser)}
                  isUpdating={isUpdating}
                  onEditUserName={handleEditUserName}
                  onEditUserEmail={handleEditUserEmail}
                  onResetUserPassword={handleResetUserPassword}
                  onResetUserMfa={handleResetUserMfa}
                  onDeleteUser={handleDeleteUser}
                />
              ) : (
                <FacilityAccessTab
                  user={user}
                  isUpdating={isUpdating}
                  isUserEdited={isUserEdited}
                  onUpdateUser={handleUpdateUser}
                  updateLocalUserState={updateLocalUserState}
                  loggedInUser={loggedInUser}
                  allFacilities={allFacilities}
                />
              )}
            </div>
            {showInProgressModal && (
              <InProgressModal
                onClose={() => updateShowInProgressModal(false)}
                onContinue={() => handleContinueChangeActiveUser()}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
