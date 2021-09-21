import React from "react";
import { Prompt } from "react-router-dom";

import { Role } from "../../permissions";
import { displayFullName } from "../../utils";
import Button from "../../commonComponents/Button/Button";
import { formatUserStatus } from "../../utils/text";

import { SettingsUser, UserFacilitySetting } from "./ManageUsersContainer";
import { UpdateUser } from "./ManageUsers";
import InProgressModal from "./InProgressModal";
import UserFacilitiesSettingsForm from "./UserFacilitiesSettingsForm";
import UserRoleSettingsForm from "./UserRoleSettingsForm";
import "./ManageUsers.scss";
import ResetPasswordForm from "./ResetPassword/ResetPasswordForm";
import DeleteUserForm from "./DeleteUser/DeleteUserForm";
import ReactivateUserForm from "./ReactivateUser/ReactivateUserForm";

interface Props {
  user: SettingsUser;
  isUpdating: boolean;
  loggedInUser: User;
  allFacilities: UserFacilitySetting[];
  handleUpdateUser: () => void;
  onDeleteUser: (userId: string) => void;
  onReactivateUser: () => void;
  updateUser: UpdateUser;
  showInProgressModal: boolean;
  updateShowInProgressModal: (showInProgressUserModal: boolean) => void;
  isUserEdited: boolean;
  onContinueChangeActiveUser: () => void;
}
const roles: Role[] = ["ADMIN", "ENTRY_ONLY", "USER"];

const UserDetail: React.FC<Props> = ({
  user,
  loggedInUser,
  allFacilities,
  updateUser,
  handleUpdateUser,
  onDeleteUser,
  onReactivateUser,
  isUpdating,
  showInProgressModal,
  updateShowInProgressModal,
  isUserEdited,
  onContinueChangeActiveUser,
}) => {
  return (
    <div className="tablet:grid-col padding-left-2">
      <div className="user-header grid-row flex-row flex-align-center">
        <div>
          <h2 className="display-inline-block margin-y-1">
            {displayFullName(user.firstName, user.middleName, user.lastName)}
          </h2>
          {user.status !== "ACTIVE" && (
            <div>
              <span className="top-user-status">
                {formatUserStatus(user.status)}
              </span>
            </div>
          )}
        </div>
        {user?.id === loggedInUser.id ? (
          <span className="usa-tag margin-left-1 bg-base-lighter text-ink">
            YOU
          </span>
        ) : null}
        <ReactivateUserForm
          user={user}
          isUpdating={isUpdating}
          onReactivateUser={onReactivateUser}
        />
        <ResetPasswordForm
          user={user}
          isUpdating={isUpdating}
          loggedInUser={loggedInUser}
        />
      </div>
      <div className="user-content">
        <h3 className="margin-bottom-0 padding-top-1">User roles</h3>
        <p className="text-base">
          Admins have full access to SimpleReport. They can conduct tests,
          manage test results and patient profiles, and also manage account
          settings, users, and testing facilities. Standard and testing only
          users have limited access for specific tasks, as described below.
        </p>
        <UserRoleSettingsForm
          activeUser={user}
          loggedInUser={loggedInUser}
          onUpdateUser={updateUser}
        />

        <UserFacilitiesSettingsForm
          activeUser={user}
          allFacilities={allFacilities}
          onUpdateUser={updateUser}
        />
      </div>
      <div className="usa-card__footer display-flex flex-justify margin-top-5 padding-x-0">
        <DeleteUserForm
          user={user}
          isUpdating={isUpdating}
          loggedInUser={loggedInUser}
          onDeleteUser={onDeleteUser}
        />
        <Button
          type="button"
          onClick={() => handleUpdateUser()}
          label={isUpdating ? "Saving..." : "Save changes"}
          disabled={
            !user.role ||
            !roles.includes(user.role) ||
            user?.organization?.testingFacility.length === 0 ||
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
    </div>
  );
};

export default UserDetail;
