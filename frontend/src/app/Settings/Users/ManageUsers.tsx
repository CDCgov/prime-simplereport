import React, { useState } from "react";
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
import { showNotification, displayFullNameInOrder } from "../../utils";
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
  getUsers: () => void;
}

export type SettingsUsers = { [id: string]: SettingsUser };

const ManageUsers: React.FC<Props> = ({
  users,
  loggedInUser,
  allFacilities,
  updateUserRole,
  addUserToOrg,
  deleteUser,
  getUsers,
}) => {
  let settingsUsers: SettingsUsers = users.reduce(
    (acc: SettingsUsers, user: SettingsUser) => {
      acc[user.id] = user;
      return acc;
    },
    {}
  );

  const [usersState, updateUsersState] = useState<SettingsUsers>(settingsUsers);
  const [activeUserId, updateActiveUserId] = useState<string>(
    Object.keys(settingsUsers)[0]
  ); // TODO: unless there is a desired sort algorithm, arbitrarily pick the first user
  const [nextActiveUserId, updateNextActiveUserId] = useState<string | null>(
    null
  );
  const [showInProgressModal, updateShowInProgressModal] = useState(false);
  const [showAddUserModal, updateShowAddUserModal] = useState(false);
  const [showDeleteUserModal, updateShowDeleteUserModal] = useState(false);
  const [isUserEdited, updateIsUserEdited] = useState(false);

  // only updates the local state
  function updateUser<T>(
    userId: string,
    key: string, // the field to update
    value: T // value of the field to update
  ) {
    updateUsersState({
      ...usersState,
      [userId]: {
        ...usersState[userId],
        [key]: value,
      },
    });
    updateIsUserEdited(true);
  }

  // confirm with the user if they have unsaved edits and want to change users
  const onChangeActiveUser = (nextActiveUserId: string) => {
    if (isUserEdited) {
      updateNextActiveUserId(nextActiveUserId);
      updateShowInProgressModal(true);
    } else {
      updateActiveUserId(nextActiveUserId);
    }
  };

  // proceed with changing the active user
  const onContinueChangeActiveUser = (currentActiveUserId: string) => {
    updateShowInProgressModal(false);

    updateActiveUserId(nextActiveUserId as string);
    resetUser(currentActiveUserId);
  };

  // throw away unsaved edits
  const resetUser = (userId: string) => {
    updateUsersState({
      ...usersState,
      [userId]: settingsUsers[userId],
    });
    updateIsUserEdited(false);
  };

  const handleUpdateUser = (userId: string) => {
    const selectedRoleDescription = usersState[userId]
      .roleDescription as RoleDescription;
    const selectedOrganizationRole = RoleDescriptionToOrgRole[
      selectedRoleDescription
    ] as OrganizationRole;
    updateUserRole({
      variables: {
        id: userId,
        role: selectedOrganizationRole,
      },
    })
      .then(() => {
        updateIsUserEdited(false);

        const user = usersState[userId];

        const fullName = displayFullNameInOrder(
          user.firstName,
          user.middleName,
          user.lastName
        );

        showNotification(
          toast,
          <Alert
            type="success"
            title="Changes Saved"
            body={`${fullName}'s settings have been saved`}
          />
        );
      })
      .catch((error: Error) => {
        console.log(error);
        // TODO: track error
      });
  };

  const handleAddUserToOrg = (newUserInvite: NewUserInvite) => {
    // TODO: validate form
    const { firstName, lastName, email } = { ...newUserInvite };
    addUserToOrg({
      variables: {
        firstName: firstName,
        lastName: lastName,
        email: email,
      },
    })
      .then(() => {
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
        getUsers();
      })
      .catch((error) => {
        console.log(error);
        // TODO: track error in analytics
      });
  };

  const handleDeleteUser = (userId: string) => {
    deleteUser({
      variables: {
        id: userId,
        deleted: true,
      },
    })
      .then((data) => {
        const deletedUserId = data.data.setUserIsDeleted.id;
        const user = usersState[deletedUserId];

        const fullName = displayFullNameInOrder(
          user.firstName,
          user.middleName,
          user.lastName
        );

        showNotification(
          toast,
          <Alert
            type="success"
            title={`User account removed for ${fullName}`}
          />
        );

        // remove the deleted user from the UI
        const { [deletedUserId]: value, ...usersMinusDeleted } = usersState;
        updateUsersState(usersMinusDeleted);
        updateActiveUserId(Object.keys(usersMinusDeleted)[0]); // arbitrarily pick the first user as the next active.
      })
      .catch((error: Error) => {
        console.log(error);
        // TODO: track error in analytics
      });

    const user = usersState[userId];

    const fullName = displayFullNameInOrder(
      user.firstName,
      user.middleName,
      user.lastName
    );

    let successAlert = (
      <Alert type="success" title={`User account removed for ${fullName}`} />
    );

    showNotification(toast, successAlert);
    updateShowDeleteUserModal(false);
  };

  const activeUser: SettingsUser = usersState[activeUserId];

  return (
    <div className="prime-container usa-card__container">
      <div className="usa-card__header">
        <h2>Manage Users</h2>
        {process.env.REACT_APP_ADD_NEW_USER_ENABLED === "true" ? (
          <Button
            variant="outline"
            onClick={() => updateShowAddUserModal(true)}
            label="+ New User"
          />
        ) : null}
      </div>
      {!activeUser ? (
        <div className="usa-card__body">
          <p> There are no users in this organization </p>
        </div>
      ) : (
        <div className="usa-card__body">
          <div className="grid-row">
            <UsersSideNav
              activeUserId={activeUserId}
              users={usersState}
              onChangeActiveUser={onChangeActiveUser}
            />
            <div className="tablet:grid-col">
              <div className="user-header">
                <h2 className="display-inline-block margin-top-2 margin-bottom-105">
                  {displayFullNameInOrder(
                    activeUser.firstName,
                    activeUser.middleName,
                    activeUser.lastName
                  )}
                </h2>
                {activeUser.id === loggedInUser.id ? (
                  <span className="usa-tag margin-left-1">YOU</span>
                ) : null}
              </div>
              <div className="user-content">
                <p>
                  Permissions to manage settings and users are limited to admins
                  only
                </p>
                <UserRoleSettingsForm
                  activeUser={activeUser}
                  loggedInUser={loggedInUser}
                  onUpdateUser={updateUser}
                />

                {process.env.REACT_APP_VIEW_USER_FACILITIES === "true" ? (
                  <UserFacilitiesSettingsForm
                    activeUser={activeUser}
                    allFacilities={allFacilities}
                    onUpdateUser={updateUser}
                  />
                ) : null}
              </div>
              <div className="usa-card__footer display-flex flex-justify margin-top-5">
                {process.env.REACT_APP_DELETE_USER_ENABLED === "true" ? (
                  <Button
                    variant="outline"
                    icon="trash"
                    className="flex-align-self-start display-inline-block"
                    onClick={() => updateShowDeleteUserModal(true)}
                    label="+ Remove User"
                    disabled={loggedInUser.id === activeUser.id}
                  />
                ) : null}
                <Button
                  type="button"
                  onClick={() => handleUpdateUser(activeUserId)}
                  label="Save changes"
                  disabled={
                    // enabled only if the user has been edited AND the loggedInUser is an org admin or super admin
                    !isUserEdited ||
                    !["Admin user", "Admin user (SU)"].includes(
                      loggedInUser.roleDescription
                    )
                  }
                />
              </div>

              {showInProgressModal ? (
                <InProgressModal
                  onClose={() => updateShowInProgressModal(false)}
                  onContinue={() => onContinueChangeActiveUser(activeUserId)}
                />
              ) : null}
              {isUserEdited ? (
                <Prompt
                  when={isUserEdited}
                  message="You have unsaved changes. Do you want to continue?"
                />
              ) : null}
              {showAddUserModal &&
              process.env.REACT_APP_ADD_NEW_USER_ENABLED === "true" ? (
                <CreateUserModal
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
