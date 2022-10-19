import React, { useEffect, useState } from "react";
import { ApolloQueryResult } from "@apollo/client";

import Button from "../../commonComponents/Button/Button";
import { displayFullName } from "../../utils";
import { showSuccess } from "../../utils/srToast";
import reload from "../../utils/reload";
import {
  UserPermission,
  useGetUserLazyQuery,
  GetUsersAndStatusQuery,
} from "../../../generated/graphql";

import CreateUserModal from "./CreateUserModal";
import UsersSideNav from "./UsersSideNav";
import UserDetail from "./UserDetail";
import {
  SettingsUser,
  LimitedUser,
  UserFacilitySetting,
} from "./ManageUsersContainer";
import "./ManageUsers.scss";

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
  const [activeUser, updateActiveUser] = useState<LimitedUser>();
  const [
    userWithPermissions,
    updateUserWithPermissions,
  ] = useState<SettingsUser | null>();
  const [queryUserWithPermissions] = useGetUserLazyQuery({
    variables: { id: activeUser ? activeUser.id : loggedInUser.id },
    fetchPolicy: "no-cache",
    onCompleted: (data) => updateUserWithPermissions(data.user),
  });
  const [nextActiveUserId, updateNextActiveUserId] = useState<string | null>(
    null
  );
  const [showInProgressModal, updateShowInProgressModal] = useState(false);
  const [showAddUserModal, updateShowAddUserModal] = useState(false);
  const [showEditUserNameModal, updateEditUserNameModal] = useState(false);
  const [showEditUserEmailModal, updateEditUserEmailModal] = useState(false);
  const [showResetPasswordModal, updateShowResetPasswordModal] = useState(
    false
  );
  const [showResetMfaModal, updateShowResetMfaModal] = useState(false);
  const [showDeleteUserModal, updateShowDeleteUserModal] = useState(false);
  const [showReactivateUserModal, updateShowReactivateUserModal] = useState(
    false
  );
  const [
    showResendUserActivationEmailModal,
    updateShowResendUserActivationEmailModal,
  ] = useState(false);
  const [isUserEdited, updateIsUserEdited] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error>();
  // Maintain deleted user ID on client while request is in flight
  const [deletedUserId, setDeletedUserId] = useState<string>();
  // Maintain added user on client while request is in flight
  const [addedUserId, setAddedUserId] = useState<string>();

  if (error) {
    throw error;
  }

  // Local users will be more up-to-date than users, which only gets updated after server requests complete
  let localUsers = [...users];
  if (deletedUserId) {
    localUsers = localUsers.filter(({ id }) => id !== deletedUserId);
  }

  const usersState: LimitedUsers = getLimitedUser(localUsers);
  const sortedUsers = sortUsers(usersState);

  // only updates the local state
  const updateUser: UpdateUser = (key, value) => {
    if (activeUser && userWithPermissions) {
      updateUserWithPermissions({
        ...userWithPermissions,
        [key]: value,
      });
      updateIsUserEdited(true);
    }
  };

  // confirm with the user if they have unsaved edits and want to change users
  const onChangeActiveUser = (nextActiveUserId: string) => {
    if (isUserEdited) {
      updateNextActiveUserId(nextActiveUserId);
      updateShowInProgressModal(true);
    } else {
      updateActiveUser(usersState[nextActiveUserId]);
      queryUserWithPermissions();
    }
  };

  // proceed with changing the active user
  const onContinueChangeActiveUser = () => {
    updateIsUserEdited(false);
    updateShowInProgressModal(false);
    if (nextActiveUserId) {
      updateActiveUser(usersState[nextActiveUserId]);
      queryUserWithPermissions();
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
      .then(() => {
        getUsers();
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
    // TODO: validate form
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
        variables: { firstName, lastName, email, role: role },
      });
      const addedUser = data?.addUserToCurrentOrg?.id;
      if (!addedUser) {
        throw new Error("Error adding user");
      }
      await updateUserPrivileges({
        variables: {
          id: addedUser,
          role: role,
          facilities: organization?.testingFacility.map(({ id }) => id) || [],
          accessAllFacilities:
            permissions?.includes(UserPermission.AccessAllFacilities) || false,
        },
      });

      await getUsers();
      const fullName = displayFullName(firstName, "", lastName);
      showSuccess(
        "They will receive an invitation to create an account at the email address provided",
        `Invitation sent to ${fullName}`
      );
      updateShowAddUserModal(false);
      setAddedUserId(addedUser);
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
      updateEditUserNameModal(false);
      showSuccess("", `User name changed to ${fullName}`);
      queryUserWithPermissions();
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
      updateEditUserEmailModal(false);
      showSuccess("", `User email address changed to ${emailAddress}`);
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
      updateShowResetPasswordModal(false);
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
      updateShowResetMfaModal(false);
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
      updateShowDeleteUserModal(false);
      setDeletedUserId(userId);
      showSuccess("", `User account removed for ${fullName}`);
      await getUsers();
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
      updateShowReactivateUserModal(false);
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
      updateShowResendUserActivationEmailModal(false);
      showSuccess("", `${fullName} has been sent a new invitation.`);
    } catch (e: any) {
      setError(e);
    }
  };

  // Default to first user
  useEffect(() => {
    if (!activeUser && sortedUsers.length) {
      updateActiveUser(sortedUsers[0]);
      queryUserWithPermissions();
    }
  }, [activeUser, sortedUsers, queryUserWithPermissions]);

  // Navigate to added user, if applicable
  useEffect(() => {
    if (addedUserId && usersState[addedUserId]) {
      updateActiveUser(usersState[addedUserId]);
      queryUserWithPermissions();
      setAddedUserId(undefined);
    }
  }, [addedUserId, usersState, queryUserWithPermissions]);

  // Navigate to correct user on user deletion (first sorted, unless the deleted user was first)
  useEffect(() => {
    if (deletedUserId) {
      const nextUser: LimitedUser =
        sortedUsers[0].id === deletedUserId && sortedUsers.length > 1
          ? sortedUsers[1]
          : sortedUsers[0];
      updateActiveUser(nextUser);
      queryUserWithPermissions();
      setDeletedUserId(undefined);
    }
  }, [deletedUserId, sortedUsers, queryUserWithPermissions]);

  // If there's no userWithPermisions, call the permissions query again
  useEffect(() => {
    if (userWithPermissions === undefined) {
      queryUserWithPermissions();
    }
  }, [queryUserWithPermissions, userWithPermissions]);

  const user: SettingsUser = userWithPermissions
    ? userWithPermissions
    : emptySettingsUser;

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
          isUpdating={isUpdating}
          onClose={() => updateShowAddUserModal(false)}
          onSubmit={handleAddUserToOrg}
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
            <UserDetail
              user={user}
              isUpdating={isUpdating}
              loggedInUser={loggedInUser}
              allFacilities={allFacilities}
              handleUpdateUser={handleUpdateUser}
              handleDeleteUser={handleDeleteUser}
              updateUser={updateUser}
              showReactivateUserModal={showReactivateUserModal}
              updateShowReactivateUserModal={updateShowReactivateUserModal}
              showResendUserActivationEmailModal={
                showResendUserActivationEmailModal
              }
              updateShowResendUserActivationEmailModal={
                updateShowResendUserActivationEmailModal
              }
              showEditUserNameModal={showEditUserNameModal}
              updateEditUserNameModal={updateEditUserNameModal}
              showEditUserEmailModal={showEditUserEmailModal}
              updateEditUserEmailModal={updateEditUserEmailModal}
              showResetUserPasswordModal={showResetPasswordModal}
              updateShowResetPasswordModal={updateShowResetPasswordModal}
              showResetUserMfaModal={showResetMfaModal}
              updateShowResetMfaModal={updateShowResetMfaModal}
              showDeleteUserModal={showDeleteUserModal}
              updateShowDeleteUserModal={updateShowDeleteUserModal}
              showInProgressModal={showInProgressModal}
              updateShowInProgressModal={updateShowInProgressModal}
              isUserEdited={isUserEdited}
              onContinueChangeActiveUser={onContinueChangeActiveUser}
              handleReactivateUser={handleReactivateUser}
              handleEditUserName={handleEditUserName}
              handleEditUserEmail={handleEditUserEmail}
              handleResetUserPassword={handleResetUserPassword}
              handleResetUserMfa={handleResetUserMfa}
              handleResendUserActivationEmail={handleResendUserActivationEmail}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
