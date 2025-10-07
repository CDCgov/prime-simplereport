import React, { useState } from "react";

import { displayFullName } from "../../utils";
import Button from "../../commonComponents/Button/Button";
import { capitalizeText, formatUserStatus } from "../../utils/text";
import { ReactComponent as DeactivatedIcon } from "../../../img/account-deactivated.svg";
import { ReactComponent as PendingIcon } from "../../../img/account-pending.svg";
import { OktaUserStatus } from "../../utils/user";
import Alert from "../../commonComponents/Alert";

import { SettingsUser } from "./ManageUsersContainer";
import ReactivateUserModal from "./ReactivateUserModal";
import ResendActivationEmailModal from "./ResendActivationEmailModal";
import "./ManageUsers.scss";

export const UserStatusSubheading: React.FC<{ user: SettingsUser }> = ({
  user,
}) => {
  function getUserStatusText() {
    if (user.status === OktaUserStatus.ACTIVE) {
      return (
        <span className="top-user-status padding-left-0">
          {capitalizeText(user.role ?? "")}
        </span>
      );
    } else if (user.status === OktaUserStatus.PROVISIONED) {
      return (
        <>
          <PendingIcon />
          <span className="top-user-status">
            {formatUserStatus(user.status)}
          </span>
        </>
      );
    } else if (user.status === OktaUserStatus.SUSPENDED) {
      return (
        <>
          <DeactivatedIcon />
          <span className="top-user-status">
            {user.isDeleted ? "Account deleted" : formatUserStatus(user.status)}
          </span>
        </>
      );
    }
  }

  return <div className="user-status-subheader">{getUserStatusText()}</div>;
};

export const SpecialStatusNotice: React.FC<{
  user: SettingsUser;
  isUpdating: boolean;
  handleResendUserActivationEmail: (userId: string) => void;
  handleReactivateUser: (userId: string) => void;
}> = ({
  user,
  isUpdating,
  handleResendUserActivationEmail,
  handleReactivateUser,
}) => {
  const [
    showResendUserActivationEmailModal,
    updateShowResendUserActivationEmailModal,
  ] = useState(false);
  const [showReactivateUserModal, updateShowReactivateUserModal] =
    useState(false);

  function userStatusInfo() {
    if (user.status === OktaUserStatus.SUSPENDED && !user.isDeleted) {
      return (
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
          {showReactivateUserModal && (
            <ReactivateUserModal
              user={user}
              onClose={() => updateShowReactivateUserModal(false)}
              onReactivateUser={handleReactivateUser}
            />
          )}
        </>
      );
    } else if (user.status === OktaUserStatus.PROVISIONED) {
      return (
        <>
          <div className="status-tagline">
            This user hasn’t set up their account.
          </div>
          <Button
            variant="outline"
            className="margin-left-auto margin-bottom-1"
            onClick={() => updateShowResendUserActivationEmailModal(true)}
            label="Send account setup email"
            disabled={isUpdating}
          />
          {showResendUserActivationEmailModal && (
            <ResendActivationEmailModal
              user={user}
              onClose={() => updateShowResendUserActivationEmailModal(false)}
              onResendActivationEmail={handleResendUserActivationEmail}
            />
          )}
        </>
      );
    }
  }

  return (
    <div className="user-header grid-row flex-row flex-align-center">
      {userStatusInfo()}
    </div>
  );
};

export const NoFacilityWarning: React.FC<{ user: SettingsUser }> = ({
  user,
}) => {
  if (
    user?.id &&
    (!user?.organization?.testingFacility ||
      user?.organization?.testingFacility.length === 0)
  ) {
    return (
      <Alert
        type={"warning"}
        title={"No facility assigned"}
        body={"All users must have access to at least one facility"}
      />
    );
  }
  return null;
};

export const UserHeading: React.FC<{
  user: SettingsUser;
  isUserSelf?: boolean;
  isUpdating: boolean;
  handleResendUserActivationEmail: (userId: string) => void;
  handleReactivateUser: (userId: string) => void;
}> = ({
  user,
  isUserSelf,
  isUpdating,
  handleResendUserActivationEmail,
  handleReactivateUser,
}) => {
  return (
    <>
      <div>
        <h2 className="display-inline-block margin-top-1 margin-bottom-0 user-name-header">
          {displayFullName(user.firstName, user.middleName, user.lastName)}
          {isUserSelf && (
            <span className="usa-tag margin-left-1 bg-base-lighter text-ink">
              YOU
            </span>
          )}
        </h2>
        <UserStatusSubheading user={user} />
      </div>
      <SpecialStatusNotice
        user={user}
        isUpdating={isUpdating}
        handleResendUserActivationEmail={handleResendUserActivationEmail}
        handleReactivateUser={handleReactivateUser}
      />
      <NoFacilityWarning user={user} />
    </>
  );
};
export const isUserActive = (user: SettingsUser) =>
  user.status !== OktaUserStatus.SUSPENDED &&
  user.status !== OktaUserStatus.PROVISIONED &&
  !user.isDeleted;
export const isUserSelf = (
  user: { id: string },
  loggedInUser: { id: string }
) => user.id === loggedInUser.id;
