import React, { useEffect, useState } from "react";
import { Prompt } from "react-router-dom";
import { toast } from "react-toastify";

import Alert from "../../commonComponents/Alert";
import Button from "../../commonComponents/Button";
import CreateUserModal from "./CreateUserModal";
import DeleteUserModal from "./DeleteUserModal";
import InProgressModal from "./InProgressModal";
import UserFacilitiesSettingsForm from "./UserFacilitiesSettingsForm";
import UserRoleSettingsForm from "./UserRoleSettingsForm";
import UsersSideNav from "./UsersSideNav";
import {
  SettingsUser,
  UserFacilitySetting,
  NewUserInvite,
} from "./ManageUsersContainer";
import {
  showNotification,
  displayFullNameInOrder,
  displayFullName,
} from "../../utils";
import { OrganizationRole, RoleDescription } from "../../permissions";

import "./ManageUsers.scss";

const RoleDescriptionToOrgRole = {
  "Admin user": "ADMIN",
  "Standard user": "USER",
  "Test-entry user": "ENTRY_ONLY",
};

interface Props {
  users: SettingsUser[];
  loggedInUser: User;
  allFacilities: UserFacilitySetting[];
  updateUserRole: (variables: any) => Promise<any>;
  addUserToOrg: (variables: any) => Promise<any>;
  deleteUser: (variables: any) => Promise<any>;
  getUsers: () => Promise<any>;
}

export type SettingsUsers = { [id: string]: SettingsUser };

const sortUsers = (users: SettingsUsers) =>
  Object.values(users).sort((a, b) => {
    const nameA = displayFullName(a.firstName, a.middleName, a.lastName);
    const nameB = displayFullName(b.firstName, b.middleName, b.lastName);
    if (nameA === nameB) return 0;
    return nameA > nameB ? 1 : -1;
  });

const getSettingsUser = (users: SettingsUser[]) =>
  users.reduce((acc: SettingsUsers, user: SettingsUser) => {
    acc[user.id] = user;
    return acc;
  }, {});

const ManageUsers: React.FC<Props> = ({
  users,
  loggedInUser,
  allFacilities,
  updateUserRole,
  addUserToOrg,
  deleteUser,
  getUsers,
}) => {
  const [activeUser, updateActiveUser] = useState<SettingsUser>();
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
  const usersState: SettingsUsers = getSettingsUser(localUsers);
  const sortedUsers = sortUsers(usersState);

  // only updates the local state
  function updateUser<T>(
    userId: string,
    key: string, // the field to update
    value: T // value of the field to update
  ) {
    updateActiveUser({
      ...usersState[userId],
      [key]: value,
    });
    updateIsUserEdited(true);
  }

  // confirm with the user if they have unsaved edits and want to change users
  const onChangeActiveUser = (nextActiveUserId: string) => {
    if (isUserEdited) {
      updateNextActiveUserId(nextActiveUserId);
      updateShowInProgressModal(true);
    } else {
      updateActiveUser(usersState[nextActiveUserId]);
    }
  };

  // proceed with changing the active user
  const onContinueChangeActiveUser = () => {
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
    const selectedRoleDescription = activeUser.roleDescription as RoleDescription;
    const selectedOrganizationRole = RoleDescriptionToOrgRole[
      selectedRoleDescription
    ] as OrganizationRole;
    updateUserRole({
      variables: {
        id: activeUser.id,
        role: selectedOrganizationRole,
      },
    })
      .then(() => {
        getUsers();
        updateIsUserEdited(false);
        const user = usersState[activeUser.id];
        const fullName = displayFullNameInOrder(
          user.firstName,
          user.middleName,
          user.lastName
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

  const handleAddUserToOrg = async (newUserInvite: NewUserInvite) => {
    // TODO: validate form
    try {
      setIsUpdating(true);
      const { firstName, lastName, email, role } = { ...newUserInvite };
      const { data } = await addUserToOrg({
        variables: { firstName, lastName, email, role: role || undefined },
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
      setAddedUserId(data?.addUserToCurrentOrg?.id);
      setIsUpdating(false);
    } catch (e) {
      setError(e);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const data = await deleteUser({
        variables: {
          id: userId,
          deleted: true,
        },
      });
      const deletedUserId = data.data.setUserIsDeleted.id;
      const user = usersState[deletedUserId];

      const fullName = displayFullNameInOrder(
        user.firstName,
        user.middleName,
        user.lastName
      );
      updateShowDeleteUserModal(false);
      setDeletedUserId(userId);
      showNotification(
        toast,
        <Alert type="success" title={`User account removed for ${fullName}`} />
      );
      await getUsers();
      updateActiveUser(sortedUsers[0]); // arbitrarily pick the first user as the next active.
      setDeletedUserId(undefined);
    } catch (e) {
      setError(e);
    }
  };

  // Default to first user
  useEffect(() => {
    if (!activeUser && sortedUsers.length) {
      updateActiveUser(sortedUsers[0]);
    }
  }, [activeUser, sortedUsers]);

  // Navigate to addeed user, if applicable
  useEffect(() => {
    if (addedUserId && usersState[addedUserId]) {
      updateActiveUser(usersState[addedUserId]);
      setAddedUserId(undefined);
    }
  }, [addedUserId, usersState]);

  return (
    <div className="prime-container usa-card__container">
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
                    activeUser={activeUser}
                    loggedInUser={loggedInUser}
                    onUpdateUser={updateUser}
                  />
                }

                {process.env.REACT_APP_VIEW_USER_FACILITIES === "true" ? (
                  <UserFacilitiesSettingsForm
                    activeUser={activeUser}
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
                    // enabled only if the user has been edited AND the loggedInUser is an org admin or super admin
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
              {showAddUserModal &&
              process.env.REACT_APP_ADD_NEW_USER_ENABLED === "true" ? (
                <CreateUserModal
                  isUpdating={isUpdating}
                  onClose={() => updateShowAddUserModal(false)}
                  onSubmit={handleAddUserToOrg}
                />
              ) : null}
              {showDeleteUserModal &&
              process.env.REACT_APP_DELETE_USER_ENABLED === "true" ? (
                <DeleteUserModal
                  user={activeUser}
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
