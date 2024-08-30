import React from "react";

import { SettingsUser } from "../../Settings/Users/ManageUsersContainer";
import { displayFullName } from "../../utils";
import { OktaUserStatus } from "../../utils/user";
import { capitalizeText, formatUserStatus } from "../../utils/text";
import Alert from "../Alert";
import { ReactComponent as DeactivatedIcon } from "../../../img/account-deactivated.svg";
import { ReactComponent as PendingIcon } from "../../../img/account-pending.svg";
import { User } from "../../../generated/graphql";

import { SpecialStatusNotice } from "./SpecialStatusNotice";
import "./UserHeading.scss";

const NoFacilityWarning: React.FC<{ user: SettingsUser | User }> = ({
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

const UserStatusSubheading: React.FC<{ user: SettingsUser | User }> = ({
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

const UserHeading: React.FC<{
  user: SettingsUser | User;
  isUserSelf?: boolean;
  isUpdating: boolean;
  onResendUserActivationEmail: (_userId: string) => void;
  onReactivateUser: (_userId: string) => void;
  onUndeleteUser: () => void;
}> = ({
  user,
  isUserSelf,
  isUpdating,
  onResendUserActivationEmail,
  onReactivateUser,
  onUndeleteUser,
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
        onResendUserActivationEmail={onResendUserActivationEmail}
        onReactivateUser={onReactivateUser}
        onUndeleteUser={onUndeleteUser}
      />
      <NoFacilityWarning user={user} />
    </>
  );
};

export default UserHeading;
