import classnames from "classnames";
import React, { useState } from "react";

import Button from "../../commonComponents/Button/Button";
import { User } from "../../../generated/graphql";
import SeparatorLine from "../../supportAdmin/Components/SeparatorLine";

import { SettingsUser } from "./ManageUsersContainer";
import DeleteUserModal from "./DeleteUserModal";
import ResetUserPasswordModal from "./ResetUserPasswordModal";
import ResetUserMfaModal from "./ResetUserMfaModal";
import EditUserNameModal from "./EditUserNameModal";
import EditUserEmailModal from "./EditUserEmailModal";
import "./UserInfoTab.scss";

interface UserInfoTabProps {
  user: SettingsUser | User;
  isUserActive: boolean;
  isUserSelf?: boolean;
  isUpdating: boolean;
  onEditUserName: (
    userId: string,
    firstName: string,
    middleName: string,
    lastName: string,
    suffix: string
  ) => void;
  onEditUserEmail: (userId: string, emailAddress: string) => void;
  onResetUserPassword: (userId: string) => void;
  onResetUserMfa: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
}
const UserInfoTab: React.FC<UserInfoTabProps> = ({
  user,
  isUserActive,
  isUserSelf,
  isUpdating,
  onEditUserName,
  onEditUserEmail,
  onResetUserPassword,
  onResetUserMfa,
  onDeleteUser,
}) => {
  const [showDeleteUserModal, updateShowDeleteUserModal] = useState(false);
  const [showResetMfaModal, updateShowResetMfaModal] = useState(false);
  const [showEditUserNameModal, updateEditUserNameModal] = useState(false);
  const [showEditUserEmailModal, updateEditUserEmailModal] = useState(false);
  const [showResetPasswordModal, updateShowResetPasswordModal] =
    useState(false);

  return (
    <>
      <div
        role="tabpanel"
        aria-labelledby={"userinformation-tab"}
        className="padding-left-1"
      >
        <h3 className="basic-info-header">Basic information</h3>
        <div
          className={classnames(
            "user-header grid-row flex-row flex-align-center",
            { "disabled-dark": !isUserActive }
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
            disabled={isUpdating || !isUserActive}
          />
        </div>
        <div
          className={classnames(
            "user-header grid-row flex-row flex-align-center",
            { "disabled-dark": !isUserActive }
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
            disabled={isUpdating || !isUserActive}
          />
        </div>
        <SeparatorLine classNames={"margin-left-neg-4 margin-right-neg-2"} />
        <h3 className="user-controls-header">User controls</h3>
        <div
          className={classnames(
            "user-header grid-row flex-row flex-align-center",
            { "disabled-dark": !isUserActive }
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
            disabled={isUpdating || !isUserActive}
          />
        </div>
        <div
          className={classnames(
            "user-header grid-row flex-row flex-align-center",
            { "disabled-dark": !isUserActive }
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
            disabled={isUpdating || !isUserActive}
          />
        </div>
        {!user.isDeleted && (
          <div
            className={classnames(
              "user-header grid-row flex-row flex-align-center",
              {
                "disabled-dark": isUserSelf,
              }
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
              disabled={isUpdating || isUserSelf}
            />
          </div>
        )}
      </div>
      {showDeleteUserModal && (
        <DeleteUserModal
          user={user}
          onClose={() => updateShowDeleteUserModal(false)}
          onDeleteUser={onDeleteUser}
        />
      )}
      {showResetPasswordModal && (
        <ResetUserPasswordModal
          user={user}
          onClose={() => updateShowResetPasswordModal(false)}
          onResetPassword={onResetUserPassword}
        />
      )}
      {showResetMfaModal && (
        <ResetUserMfaModal
          user={user}
          onClose={() => updateShowResetMfaModal(false)}
          onResetMfa={onResetUserMfa}
        />
      )}
      {showEditUserNameModal && (
        <EditUserNameModal
          user={user}
          onClose={() => updateEditUserNameModal(false)}
          onEditUserName={onEditUserName}
        />
      )}
      {showEditUserEmailModal && (
        <EditUserEmailModal
          user={user}
          onClose={() => updateEditUserEmailModal(false)}
          onEditUserEmail={onEditUserEmail}
        />
      )}
    </>
  );
};

export default UserInfoTab;
