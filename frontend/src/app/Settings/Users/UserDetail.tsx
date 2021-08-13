import React from "react";
import { Prompt } from "react-router-dom";

import { Role } from "../../permissions";
import { displayFullNameInOrder } from "../../utils";
import Button from "../../commonComponents/Button/Button";

import { SettingsUser, UserFacilitySetting } from "./ManageUsersContainer";
import { UpdateUser } from "./ManageUsers";
import InProgressModal from "./InProgressModal";
import DeleteUserModal from "./DeleteUserModal";
import UserFacilitiesSettingsForm from "./UserFacilitiesSettingsForm";
import UserRoleSettingsForm from "./UserRoleSettingsForm";
import ReactivateUserModal from "./ReactivateUserModal";
import "./ManageUsers.scss";

interface Props {
  user: SettingsUser;
  isUpdating: boolean;
  loggedInUser: User;
  allFacilities: UserFacilitySetting[];
  handleUpdateUser: () => void;
  handleDeleteUser: (userId: string) => void;
  updateUser: UpdateUser;
  showReactivateUserModal: boolean;
  updateShowReactivateUserModal: (showReactivateUserModal: boolean) => void;
  showDeleteUserModal: boolean;
  updateShowDeleteUserModal: (showDeleteUserModal: boolean) => void;
  showInProgressModal: boolean;
  updateShowInProgressModal: (showInProgressUserModal: boolean) => void;
  isUserEdited: boolean;
  onContinueChangeActiveUser: () => void;
  handleReactivateUser: (userId: string) => void;
}
const roles: Role[] = ["ADMIN", "ENTRY_ONLY", "USER"];

const UserDetail: React.FC<Props> = ({
  user,
  loggedInUser,
  allFacilities,
  updateUser,
  handleUpdateUser,
  isUpdating,
  handleDeleteUser,
  showReactivateUserModal,
  updateShowReactivateUserModal,
  showDeleteUserModal,
  updateShowDeleteUserModal,
  showInProgressModal,
  updateShowInProgressModal,
  isUserEdited,
  onContinueChangeActiveUser,
  handleReactivateUser,
}) => {
  return (
    <div className="tablet:grid-col padding-left-2">
      <div className="user-header grid-row flex-row flex-align-center">
        <h2 className="display-inline-block margin-y-1">
          {displayFullNameInOrder(
            user.firstName,
            user.middleName,
            user.lastName
          )}
        </h2>
        {user?.id === loggedInUser.id ? (
          <span className="usa-tag margin-left-1 bg-base-lighter text-ink">
            YOU
          </span>
        ) : null}
        {process.env.REACT_APP_EDIT_USER_ROLE === "true" &&
        user.status === "SUSPENDED" ? (
          <Button
            variant="secondary"
            className="margin-left-auto margin-bottom-1"
            onClick={() => updateShowReactivateUserModal(true)}
            label="Reactivate user"
            disabled={isUpdating}
          />
        ) : null}
      </div>
      <div className="user-content">
        <p className="text-base">
          Admins have full access to conduct tests, manage results and profiles,
          and manage settings and users
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
            disabled={loggedInUser.id === user.id || isUpdating}
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
      {showReactivateUserModal &&
      process.env.REACT_APP_EDIT_USER_ROLE === "true" ? (
        <ReactivateUserModal
          user={user}
          onClose={() => updateShowReactivateUserModal(false)}
          onReactivateUser={handleReactivateUser}
        />
      ) : null}
    </div>
  );
};

export default UserDetail;
