import React, { useEffect, useState } from "react";
import { Prompt } from "react-router-dom";
import { toast } from "react-toastify";
import { useLazyQuery } from "@apollo/client";

import Alert from "../../commonComponents/Alert";
import Button from "../../commonComponents/Button/Button";
import {
  showNotification,
  displayFullNameInOrder,
  displayFullName,
} from "../../utils";
import { Role } from "../../permissions";

import CreateUserModal from "./CreateUserModal";
import DeleteUserModal from "./DeleteUserModal";
import InProgressModal from "./InProgressModal";
import UserFacilitiesSettingsForm from "./UserFacilitiesSettingsForm";
import UserRoleSettingsForm from "./UserRoleSettingsForm";
import UsersSideNav from "./UsersSideNav";
import {
  SettingsUser,
  LimitedUser,
  UserFacilitySetting,
  SingleUserData,
  GET_USER,
} from "./ManageUsersContainer";

import "./ManageUsers.scss";

interface Props {
  users: LimitedUser[];
  loggedInUser: User;
  allFacilities: UserFacilitySetting[];
  updateUserPrivileges: (variables: any) => Promise<any>;
  addUserToOrg: (variables: any) => Promise<any>;
  deleteUser: (variables: any) => Promise<any>;
  getUsers: () => Promise<any>;
}

export type LimitedUsers = { [id: string]: LimitedUser };

export type SettingsUsers = { [id: string]: SettingsUser };

export type UpdateUser = <K extends keyof SettingsUser>(
  key: K,
  value: SettingsUser[K]
) => void;

const roles: Role[] = ["ADMIN", "ENTRY_ONLY", "USER"];

const emptySettingsUser: SettingsUser = {
  firstName: "",
  middleName: "",
  lastName: "",
  id: "",
  email: "",
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
  deleteUser,
  getUsers,
}) => {
  const [activeUser, updateActiveUser] = useState<LimitedUser>();
  const [
    userWithPermissions,
    updateUserWithPermissions,
  ] = useState<SettingsUser>();
  const [queryUserWithPermissions] = useLazyQuery<SingleUserData, {}>(
    GET_USER,
    {
      variables: { id: activeUser ? activeUser.id : loggedInUser.id },
      fetchPolicy: "no-cache",
      onCompleted: (data) => updateUserWithPermissions(data.user),
    }
  );
  const [nextActiveUserId, updateNextActiveUserId] = useState<string | null>(
    null
  );
  const [showInProgressModal, updateShowInProgressModal] = useState(false);
  const [showAddUserModal, updateShowAddUserModal] = useState(false);
  const [showDeleteUserModal, updateShowDeleteUserModal] = useState(false);
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
        facilities: userWithPermissions?.organization.testingFacility.map(
          ({ id }) => id
        ),
        accessAllFacilities: userWithPermissions?.permissions.includes(
          "ACCESS_ALL_FACILITIES"
        ),
      },
    })
      .then(() => {
        getUsers();
        updateIsUserEdited(false);
        const fullName = displayFullNameInOrder(
          userWithPermissions?.firstName,
          userWithPermissions?.middleName,
          userWithPermissions?.lastName
        );
        setIsUpdating(false);
        showNotification(
          toast,
          <Alert
            type="success"
            title="Changes Saved"
            body={`${fullName}'s settings have been saved`}
          />
        );
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
            permissions?.includes("ACCESS_ALL_FACILITIES") || false,
        },
      });

      await getUsers();
      const fullName = displayFullNameInOrder(firstName, "", lastName);
      showNotification(
        toast,
        <Alert
          type="success"
          title={`Invitation sent to ${fullName}`}
          body={`They will receive an invitation to create an account at the email address provided`}
        />
      );
      updateShowAddUserModal(false);
      setAddedUserId(addedUser);
      setIsUpdating(false);
    } catch (e) {
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
      const fullName = displayFullNameInOrder(
        userWithPermissions?.firstName,
        userWithPermissions?.middleName,
        userWithPermissions?.lastName
      );
      updateShowDeleteUserModal(false);
      setDeletedUserId(userId);
      showNotification(
        toast,
        <Alert type="success" title={`User account removed for ${fullName}`} />
      );
      await getUsers();
    } catch (e) {
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
    <div className="prime-container card-container">
      <div className="usa-card__header">
        <h2>Manage Users</h2>
        {process.env.REACT_APP_ADD_NEW_USER_ENABLED === "true" ? (
          <Button
            variant="outline"
            onClick={() => updateShowAddUserModal(true)}
            label="+ New user"
          />
        ) : null}
      </div>
      {showAddUserModal &&
      process.env.REACT_APP_ADD_NEW_USER_ENABLED === "true" ? (
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
            <div className="tablet:grid-col padding-left-2">
              <div className="user-header grid-row flex-row flex-align-center">
                <h2 className="display-inline-block margin-y-1">
                  {displayFullNameInOrder(
                    activeUser.firstName,
                    activeUser.middleName,
                    activeUser.lastName
                  )}
                </h2>
                {activeUser?.id === loggedInUser.id ? (
                  <span className="usa-tag margin-left-1 bg-base-lighter text-ink">
                    YOU
                  </span>
                ) : null}
              </div>
              <div className="user-content">
                <p className="text-base">
                  Admins have full access to conduct tests, manage results and
                  profiles, and manage settings and users
                </p>
                {
                  <UserRoleSettingsForm
                    activeUser={user}
                    loggedInUser={loggedInUser}
                    onUpdateUser={updateUser}
                  />
                }

                {process.env.REACT_APP_VIEW_USER_FACILITIES === "true" ? (
                  <UserFacilitiesSettingsForm
                    activeUser={user}
                    allFacilities={allFacilities}
                    onUpdateUser={updateUser}
                  />
                ) : null}
              </div>
              <div className="usa-card__footer display-flex flex-justify margin-top-5 padding-x-0">
                {process.env.REACT_APP_DELETE_USER_ENABLED === "true" ? (
                  <Button
                    variant="outline"
                    icon="trash"
                    className="flex-align-self-start display-inline-block"
                    onClick={() => updateShowDeleteUserModal(true)}
                    label="Remove user"
                    disabled={loggedInUser.id === activeUser.id || isUpdating}
                  />
                ) : null}
                <Button
                  type="button"
                  onClick={() => handleUpdateUser()}
                  label={isUpdating ? "Saving..." : "Save changes"}
                  disabled={
                    !roles.includes(user.role) ||
                    user.organization.testingFacility.length === 0 ||
                    !isUserEdited ||
                    !["Admin user", "Admin user (SU)"].includes(
                      loggedInUser.roleDescription
                    ) ||
                    isUpdating
                  }
                />
              </div>

              {showInProgressModal && (
                <InProgressModal
                  onClose={() => updateShowInProgressModal(false)}
                  onContinue={() => onContinueChangeActiveUser()}
                />
              )}
              {isUserEdited ? (
                <Prompt
                  when={isUserEdited}
                  message="You have unsaved changes. Do you want to continue?"
                />
              ) : null}
              {showDeleteUserModal &&
              process.env.REACT_APP_DELETE_USER_ENABLED === "true" ? (
                <DeleteUserModal
                  user={user}
                  onClose={() => updateShowDeleteUserModal(false)}
                  onDeleteUser={handleDeleteUser}
                />
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
