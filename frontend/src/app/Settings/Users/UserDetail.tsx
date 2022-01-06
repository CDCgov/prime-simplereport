import React, { useState } from "react";
import classnames from "classnames";
import { Prompt } from "react-router";

import { Role } from "../../permissions";
import { displayFullName } from "../../utils";
import Button from "../../commonComponents/Button/Button";
import { capitalizeText, formatUserStatus } from "../../utils/text";
import { ReactComponent as DeactivatedIcon } from "../../../img/account-deactivated.svg";
import { ReactComponent as PendingIcon } from "../../../img/account-pending.svg";

import { SettingsUser, UserFacilitySetting } from "./ManageUsersContainer";
import { UpdateUser } from "./ManageUsers";
import UserRoleSettingsForm from "./UserRoleSettingsForm";
import UserFacilitiesSettingsForm from "./UserFacilitiesSettingsForm";
import InProgressModal from "./InProgressModal";
import DeleteUserModal from "./DeleteUserModal";
import ReactivateUserModal from "./ReactivateUserModal";
import ResendActivationEmailModal from "./ResendActivationEmailModal";
import ResetUserPasswordModal from "./ResetUserPasswordModal";
import EditUserNameModal from "./EditUserNameModal";
import EditUserEmailModal from "./EditUserEmailModal";
import ResetUserMfaModal from "./ResetUserMfaModal";
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
  showResendUserActivationEmailModal: boolean;
  updateShowResendUserActivationEmailModal: (
    showResendUserActivationEmail: boolean
  ) => void;
  showEditUserNameModal: boolean;
  updateEditUserNameModal: (showEditUserNameModal: boolean) => void;
  showEditUserEmailModal: boolean;
  updateEditUserEmailModal: (showEditUserEmailModal: boolean) => void;
  showResetUserPasswordModal: boolean;
  updateShowResetPasswordModal: (showResetPasswordModal: boolean) => void;
  showResetUserMfaModal: boolean;
  updateShowResetMfaModal: (showResetMfaModal: boolean) => void;
  showDeleteUserModal: boolean;
  updateShowDeleteUserModal: (showDeleteUserModal: boolean) => void;
  showInProgressModal: boolean;
  updateShowInProgressModal: (showInProgressUserModal: boolean) => void;
  isUserEdited: boolean;
  onContinueChangeActiveUser: () => void;
  handleReactivateUser: (userId: string) => void;
  handleEditUserName: (
    userId: string,
    firstName: string,
    middleName: string,
    lastName: string,
    suffix: string
  ) => void;
  handleEditUserEmail: (userId: string, emailAddress: string) => void;
  handleResetUserPassword: (userId: string) => void;
  handleResetUserMfa: (userId: string) => void;
  handleResendUserActivationEmail: (userId: string) => void;
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
  showResendUserActivationEmailModal,
  updateShowResendUserActivationEmailModal,
  showEditUserNameModal,
  updateEditUserNameModal,
  showEditUserEmailModal,
  updateEditUserEmailModal,
  showResetUserPasswordModal,
  updateShowResetPasswordModal,
  showResetUserMfaModal,
  updateShowResetMfaModal,
  showDeleteUserModal,
  updateShowDeleteUserModal,
  showInProgressModal,
  updateShowInProgressModal,
  isUserEdited,
  onContinueChangeActiveUser,
  handleReactivateUser,
  handleEditUserName,
  handleEditUserEmail,
  handleResetUserPassword,
  handleResetUserMfa,
  handleResendUserActivationEmail,
}) => {
  const [navItemSelected, setNavItemSelected] = useState("userInfo");

  const isUserActive = () =>
    user.status !== "SUSPENDED" && user.status !== "PROVISIONED";

  const isUserSelf = () => user.id === loggedInUser.id;

  let statusText;
  switch (user.status) {
    case "ACTIVE":
      statusText = (
        <span className="top-user-status padding-left-0">
          {capitalizeText(user.role || "")}
        </span>
      );
      break;
    case "PROVISIONED":
      statusText = (
        <>
          <PendingIcon />
          <span className="top-user-status">
            {formatUserStatus(user.status)}
          </span>
        </>
      );
      break;
    case "SUSPENDED":
      statusText = (
        <>
          <DeactivatedIcon />
          <span className="top-user-status">
            {formatUserStatus(user.status)}
          </span>
        </>
      );
      break;
    default:
      statusText = "";
  }

  return (
    <div className="tablet:grid-col padding-left-3 user-detail-column">
      <div>
        <h2 className="display-inline-block margin-top-1 margin-bottom-0 user-name-header">
          {displayFullName(user.firstName, user.middleName, user.lastName)}
          {user?.id === loggedInUser.id ? (
            <span className="usa-tag margin-left-1 bg-base-lighter text-ink">
              YOU
            </span>
          ) : null}
        </h2>
        <div className="user-status-subheader">{statusText}</div>
      </div>
      <div className="user-header grid-row flex-row flex-align-center">
        {user.status === "SUSPENDED" ? (
          <>
            <div className="status-tagline">
              Users are deactivated after 60 days of inactivity.
            </div>
            <Button
              variant="outline"
              className="margin-left-auto margin-bottom-1"
              onClick={() => updateShowReactivateUserModal(true)}
              label="Activate user"
              disabled={isUpdating}
            />
          </>
        ) : null}
        {user.status === "PROVISIONED" ? (
          <>
            <div className="status-tagline">
              This user hasn’t set up their acccount.
            </div>
            <Button
              variant="outline"
              className="margin-left-auto margin-bottom-1"
              onClick={() => updateShowResendUserActivationEmailModal(true)}
              label="Send account setup email"
              disabled={isUpdating}
            />
          </>
        ) : null}
      </div>
      <nav
        className="prime-secondary-nav margin-top-4"
        aria-label="Tertiary navigation"
      >
        <ul className="usa-nav__secondary-links prime-nav">
          <li
            className={`usa-nav__secondary-item ${
              navItemSelected === "userInfo" ? "usa-current" : ""
            }`}
            onClick={() => setNavItemSelected("userInfo")}
          >
            <span>User information</span>
          </li>
          <li
            className={`usa-nav__secondary-item ${
              navItemSelected === "facilityAccess" ? "usa-current" : ""
            }`}
            onClick={() => setNavItemSelected("facilityAccess")}
          >
            <span>Facility access</span>
          </li>
        </ul>
      </nav>
      {navItemSelected === "userInfo" ? (
        <div className="padding-left-1">
          <h4 className="basic-info-header">Basic information</h4>
          <div
            className={classnames(
              "user-header grid-row flex-row flex-align-center",
              { "disabled-dark": !isUserActive() }
            )}
          >
            <div>
              <div className="userinfo-subheader">Name</div>
              <p className="userinfo-text">
                {user.firstName +
                  (user.middleName ? ` ${user.middleName} ` : " ") +
                  user.lastName}
              </p>
            </div>
            <Button
              variant="outline"
              className="margin-left-auto margin-bottom-1"
              onClick={() => updateEditUserNameModal(true)}
              label={"Edit name"}
              disabled={isUpdating || !isUserActive()}
            />
          </div>
          <div
            className={classnames(
              "user-header grid-row flex-row flex-align-center",
              { "disabled-dark": !isUserActive() }
            )}
          >
            <div>
              <div className="userinfo-subheader">Email</div>
              <p className="userinfo-text">{user.email}</p>
            </div>
            <Button
              variant="outline"
              className="margin-left-auto margin-bottom-1"
              onClick={() => updateEditUserEmailModal(true)}
              label={"Edit email"}
              disabled={isUpdating || !isUserActive()}
            />
          </div>
          <div className="userinfo-divider"></div>
          <h4 className="user-controls-header">User controls</h4>
          <div
            className={classnames(
              "user-header grid-row flex-row flex-align-center",
              { "disabled-dark": !isUserActive() }
            )}
          >
            <div className="grid-col margin-right-8">
              <div className="userinfo-subheader">Password</div>
              <p className="usercontrols-text">
                Send a link to reset user password. Users must answer a password
                recovery question to access their account.
              </p>
            </div>
            <Button
              variant="outline"
              className="margin-left-auto margin-bottom-1"
              onClick={() => updateShowResetPasswordModal(true)}
              label={"Send password reset email"}
              disabled={isUpdating || !isUserActive()}
            />
          </div>
          <div
            className={classnames(
              "user-header grid-row flex-row flex-align-center",
              { "disabled-dark": !isUserActive() }
            )}
          >
            <div className="grid-col">
              <div className="userinfo-subheader">
                Reset multi-factor authentication (MFA)
              </div>
              <p className="usercontrols-text">
                Reset user MFA account access settings
              </p>
            </div>
            <Button
              variant="outline"
              className="margin-left-auto margin-bottom-1"
              onClick={() => updateShowResetMfaModal(true)}
              label={"Reset MFA"}
              disabled={isUpdating || !isUserActive()}
            />
          </div>
          <div
            className={classnames(
              "user-header grid-row flex-row flex-align-center",
              { "disabled-dark": isUserSelf() }
            )}
          >
            <div>
              <div className="userinfo-subheader">Delete user</div>
              <p className="usercontrols-text">
                Permanently delete user account and data
              </p>
            </div>
            <Button
              variant="outline"
              className="margin-left-auto margin-bottom-1"
              onClick={() => updateShowDeleteUserModal(true)}
              label={"Delete user"}
              disabled={isUpdating || isUserSelf()}
            />
          </div>
        </div>
      ) : (
        <div className="padding-left-1">
          <h4 className="basic-info-header margin-bottom-1">User role</h4>
          <div className="userrole-subtext">
            Admins have full access to use and change settings on SimpleReport.
            Standard and testing-only users have limited access for specific
            tasks, as described below.
          </div>
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
          <div className="usa-card__footer display-flex flex-justify margin-top-5 padding-x-0">
            <Button
              type="button"
              variant="outline"
              className="margin-left-auto"
              onClick={handleUpdateUser}
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
        </div>
      )}
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
      {showDeleteUserModal ? (
        <DeleteUserModal
          user={user}
          onClose={() => updateShowDeleteUserModal(false)}
          onDeleteUser={handleDeleteUser}
        />
      ) : null}
      {showReactivateUserModal ? (
        <ReactivateUserModal
          user={user}
          onClose={() => updateShowReactivateUserModal(false)}
          onReactivateUser={handleReactivateUser}
        />
      ) : null}
      {showResendUserActivationEmailModal ? (
        <ResendActivationEmailModal
          user={user}
          onClose={() => updateShowResendUserActivationEmailModal(false)}
          onResendActivationEmail={handleResendUserActivationEmail}
        />
      ) : null}
      {showResetUserPasswordModal ? (
        <ResetUserPasswordModal
          user={user}
          onClose={() => updateShowResetPasswordModal(false)}
          onResetPassword={handleResetUserPassword}
        />
      ) : null}
      {showResetUserMfaModal ? (
        <ResetUserMfaModal
          user={user}
          onClose={() => updateShowResetMfaModal(false)}
          onResetMfa={handleResetUserMfa}
        />
      ) : null}
      {showEditUserNameModal ? (
        <EditUserNameModal
          user={user}
          onClose={() => updateEditUserNameModal(false)}
          onEditUserName={handleEditUserName}
        />
      ) : null}
      {showEditUserEmailModal ? (
        <EditUserEmailModal
          user={user}
          onClose={() => updateEditUserEmailModal(false)}
          onEditUserEmail={handleEditUserEmail}
        />
      ) : null}
    </div>
  );
};

export default UserDetail;
