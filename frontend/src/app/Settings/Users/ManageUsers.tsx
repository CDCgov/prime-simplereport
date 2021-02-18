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
import { showNotification, displayFullName } from "../../utils";

import "./ManageUsers.scss";

interface Props {
  loggedInUser: User;
  users: SettingsUser[];
  allFacilities: UserFacilitySetting[];
  onUpdateUser: (user: SettingsUser) => void;
  onCreateNewUser: (newUserInvite: NewUserInvite) => void;
  onDeleteUser: (userId: string) => void;
}

export type SettingsUsers = { [id: string]: SettingsUser };

const ManageUsers: React.FC<Props> = ({
  allFacilities,
  loggedInUser,
  users,
  onUpdateUser,
  onCreateNewUser,
  onDeleteUser,
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
  ); // TODO: unless there is a desired sort algorithm, pick the first user
  const [nextActiveUserId, updateNextActiveUserId] = useState<string | null>(
    null
  );
  const [showInProgressModal, updateShowInProgressModal] = useState(false);
  const [showAddUserModal, updateShowAddUserModal] = useState(false);
  const [showDeleteUserModal, updateShowDeleteUserModal] = useState(false);
  const [isUserEdited, updateIsUserEdited] = useState(false);

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

  const onSaveChanges = (userId: string) => {
    onUpdateUser(usersState[userId]); // TODO this does nothing atm
    updateIsUserEdited(false);

    const user = usersState[userId];

    const fullName = displayFullName(
      user.firstName,
      user.middleName,
      user.lastName
    );

    let successAlert = (
      <Alert
        type="success"
        title="Changes Saved"
        body={`${fullName}'s settings have been saved`}
      />
    );

    showNotification(toast, successAlert);
  };

  const onChangeActiveUser = (nextActiveUserId: string) => {
    if (isUserEdited) {
      updateNextActiveUserId(nextActiveUserId);
      updateShowInProgressModal(true);
    } else {
      updateActiveUserId(nextActiveUserId);
    }
  };

  const onContinueChangeActiveUser = (currentActiveUserId: string) => {
    updateShowInProgressModal(false);

    updateActiveUserId(nextActiveUserId as string);
    resetUser(currentActiveUserId);
  };

  const resetUser = (userId: string) => {
    updateUsersState({
      ...usersState,
      [userId]: settingsUsers[userId],
    });
    updateIsUserEdited(false);
  };

  const onHandleCreateNewUser = (newUserInvite: NewUserInvite) => {
    // TODO: validate form
    onCreateNewUser(newUserInvite);

    const fullName = displayFullName(
      newUserInvite.firstName,
      null,
      newUserInvite.lastName
    );

    let successAlert = (
      <Alert
        type="success"
        title={`Invitation sent to ${fullName}`}
        body={`They will receive an invitation to create an account at the email address provided`}
      />
    );

    showNotification(toast, successAlert);
    updateShowAddUserModal(false);
  };

  const onHandleDeleteUser = (userId: string) => {
    // TODO: show alert only if delete is successful
    onDeleteUser(userId);

    const user = usersState[userId];

    const fullName = displayFullName(
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
                  {displayFullName(
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

                {process.env.REACT_APP_USER_FACILITIES_ENABLED === "true" ? (
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
                  onClick={() => onSaveChanges(activeUserId)}
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
                  onSubmit={onHandleCreateNewUser}
                />
              ) : null}
              {showDeleteUserModal &&
              process.env.REACT_APP_DELETE_USER_ENABLED === "true" ? (
                <DeleteUserModal
                  user={activeUser}
                  onClose={() => updateShowDeleteUserModal(false)}
                  onDeleteUser={onHandleDeleteUser}
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
