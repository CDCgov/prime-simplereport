import React, { useState } from "react";
import { toast } from "react-toastify";
import { Prompt } from "react-router-dom";
import classnames from "classnames";

import Alert from "../../commonComponents/Alert";
import Button from "../../commonComponents/Button";
import InProgressModal from "./InProgressModal";
import UserFacilitiesSettingsForm from "./UserFacilitiesSettingsForm";
import UserRoleSettingsForm from "./UserRoleSettingsForm";
import { SettingsUser, UserFacilitySetting } from "./ManageUsersContainer";
import { showNotification } from "../../utils";

import "./ManageUsers.scss";
import CreateUserModal from "./CreateUserModal";

interface Props {
  loggedInUser: User;
  users: SettingsUser[];
  allFacilities: UserFacilitySetting[];
  onUpdateUser: (user: SettingsUser) => void;
}

type SettingsUsers = { [id: string]: SettingsUser };

const ManageUsers: React.FC<Props> = ({
  allFacilities,
  loggedInUser,
  users,
  onUpdateUser,
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
        isEdited: true,
      },
    });
  }

  const onSaveChanges = (userId: string) => {
    onUpdateUser(usersState[userId]); // TODO this does nothing atm

    updateUsersState({
      ...usersState,
      [userId]: {
        ...usersState[userId],
        isEdited: false,
      },
    });

    let successAlert = (
      <Alert
        type="success"
        title="Changes Saved"
        body={`${usersState[userId].name}'s settings have been saved`}
      />
    );

    showNotification(toast, successAlert);
  };

  const onChangeActiveUser = (nextActiveUserId: string) => {
    if (usersState[activeUserId].isEdited) {
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

  const sideNavItems = Object.values(usersState).map((user: any) => {
    return (
      <li
        className="usa-sidenav__item users-sidenav-item"
        onClick={() => onChangeActiveUser(user.id)}
        key={user.id}
      >
        <div
          className={classnames(
            "padding-105 padding-right-2",
            activeUserId === user.id && "usa-current"
          )}
        >
          <span className="sidenav-user-name">{user.name}</span>
          <br />
          <span className="sidenav-user-email">{user.email}</span>
        </div>
      </li>
    );
  });

  const resetUser = (userId: string) => {
    updateUsersState({
      ...usersState,
      [userId]: settingsUsers[userId],
    });
  };

  const activeUser: SettingsUser = usersState[activeUserId];

  return (
    <div className="prime-container usa-card__container">
      <div className="usa-card__header">
        <h2>Manage Users</h2>
        <Button
          variant="outline"
          onClick={() => updateShowAddUserModal(true)}
          label="+ New User"
        />
      </div>
      <div className="usa-card__body">
        <div className="grid-row">
          <div className="display-block users-sidenav">
            <h3>Users</h3>
            <ul className="usa-sidenav">{sideNavItems}</ul>
          </div>
          <div className="tablet:grid-col">
            <div className="user-header">
              <h2 className="display-inline-block margin-top-2 margin-bottom-105">
                {activeUser.name}
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

              {process.env.REACT_APP_V2_ACCESS_CONTROL_ENABLED === "true" ? (
                <UserFacilitiesSettingsForm
                  activeUser={activeUser}
                  allFacilities={allFacilities}
                  onUpdateUser={updateUser}
                />
              ) : null}
            </div>
            <div className="usa-card__footer">
              <div className="float-right">
                <Button
                  type="button"
                  onClick={() => onSaveChanges(activeUserId)}
                  label="Save changes"
                  disabled={
                    loggedInUser.roleDescription !== "Admin user" ||
                    !activeUser.isEdited
                  }
                />
              </div>
            </div>
            {showInProgressModal ? (
              <InProgressModal
                onClose={() => updateShowInProgressModal(false)}
                onContinue={() => onContinueChangeActiveUser(activeUserId)}
              />
            ) : null}
            {activeUser.isEdited ? (
              <Prompt
                when={activeUser.isEdited}
                message="You have unsaved changes. Do you want to continue?"
              />
            ) : null}
            {showAddUserModal ? (
              <CreateUserModal
                onClose={() => updateShowAddUserModal(false)}
                onSubmit={() => {}}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
