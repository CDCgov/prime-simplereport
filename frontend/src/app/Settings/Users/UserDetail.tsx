import React, { useState } from "react";

import { displayFullName } from "../../utils";
import Button from "../../commonComponents/Button/Button";
import { capitalizeText, formatUserStatus } from "../../utils/text";
import { ReactComponent as DeactivatedIcon } from "../../../img/account-deactivated.svg";
import { ReactComponent as PendingIcon } from "../../../img/account-pending.svg";
import { OktaUserStatus } from "../../utils/user";
import Alert from "../../commonComponents/Alert";

import { SettingsUser, UserFacilitySetting } from "./ManageUsersContainer";
import { UpdateUser } from "./ManageUsers";
import ReactivateUserModal from "./ReactivateUserModal";
import ResendActivationEmailModal from "./ResendActivationEmailModal";
import "./ManageUsers.scss";
import { FacilityAccessTab } from "./FacilityAccessTab";
import { UserInfoTab } from "./UserInfoTab";

interface Props {
  user: SettingsUser;
  isUpdating: boolean;
  loggedInUser: User;
  allFacilities: UserFacilitySetting[];
  updateUser: UpdateUser;
  isUserEdited: boolean;
  handleUpdateUser: () => void;
  handleDeleteUser: (userId: string) => void;
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
  displayedTabs: UserDetailTab[];
}

const UserStatusSubheading: React.FC<{ user: SettingsUser }> = ({ user }) => {
  function getUserStatusText() {
    switch (user.status) {
      case OktaUserStatus.ACTIVE:
        return (
          <span className="top-user-status padding-left-0">
            {capitalizeText(user.role ?? "")}
          </span>
        );
      case OktaUserStatus.PROVISIONED:
        return (
          <>
            <PendingIcon />
            <span className="top-user-status">
              {formatUserStatus(user.status)}
            </span>
          </>
        );
      case OktaUserStatus.SUSPENDED:
        return (
          <>
            <DeactivatedIcon />
            <span className="top-user-status">
              {formatUserStatus(user.status)}
            </span>
          </>
        );
      default:
        return "";
    }
  }

  return <div className="user-status-subheader">{getUserStatusText()}</div>;
};

const SpecialStatusNotice: React.FC<{
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
    if (user.isDeleted) {
      return (
        <>
          <div className="status-tagline">Account deleted.</div>
        </>
      );
    } else {
      switch (user.status ?? "") {
        case OktaUserStatus.SUSPENDED:
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
        case OktaUserStatus.PROVISIONED:
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
                  onClose={() =>
                    updateShowResendUserActivationEmailModal(false)
                  }
                  onResendActivationEmail={handleResendUserActivationEmail}
                />
              )}
            </>
          );
        default:
          return null;
      }
    }
  }

  return (
    <div className="user-header grid-row flex-row flex-align-center">
      {userStatusInfo()}
    </div>
  );
};

const NoFacilityWarning: React.FC<{ user: SettingsUser }> = ({ user }) => {
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
export enum UserDetailTab {
  userInfo = "User information",
  facilityAccess = "Facility access",
}

const UserHeading: React.FC<{
  user: SettingsUser;
  isUserSelf: boolean;
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

const UserDetail: React.FC<Props> = ({
  user,
  loggedInUser,
  allFacilities,
  updateUser,
  isUpdating,
  isUserEdited,
  handleUpdateUser,
  handleDeleteUser,
  handleReactivateUser,
  handleEditUserName,
  handleEditUserEmail,
  handleResetUserPassword,
  handleResetUserMfa,
  handleResendUserActivationEmail,
  displayedTabs,
}) => {
  const [navItemSelected, setNavItemSelected] = useState<UserDetailTab>(
    displayedTabs[0]
  );

  const isUserActive = () =>
    user.status !== OktaUserStatus.SUSPENDED &&
    user.status !== OktaUserStatus.PROVISIONED &&
    !user.isDeleted;
  const isUserSelf = () => user.id === loggedInUser.id;

  const availableTabs = {
    [UserDetailTab.userInfo]: (
      <UserInfoTab
        isUserActive={isUserActive}
        user={user}
        isUpdating={isUpdating}
        isUserSelf={isUserSelf}
        handleDeleteUser={handleDeleteUser}
        handleEditUserEmail={handleEditUserEmail}
        handleResetUserPassword={handleResetUserPassword}
        handleResetUserMfa={handleResetUserMfa}
        handleEditUserName={handleEditUserName}
      />
    ),
    [UserDetailTab.facilityAccess]: (
      <FacilityAccessTab
        user={user}
        loggedInUser={loggedInUser}
        updateUser={updateUser}
        allFacilities={allFacilities}
        handleUpdateUser={handleUpdateUser}
        isUpdating={isUpdating}
        isUserEdited={isUserEdited}
      />
    ),
  };
  return (
    <div
      role="tabpanel"
      aria-labelledby={"user-tab-" + user?.id}
      className="tablet:grid-col padding-left-3 user-detail-column"
    >
      <UserHeading
        user={user}
        isUserSelf={isUserSelf()}
        isUpdating={isUpdating}
        handleResendUserActivationEmail={handleResendUserActivationEmail}
        handleReactivateUser={handleReactivateUser}
      />
      <nav
        className="prime-secondary-nav margin-top-4 padding-bottom-0"
        aria-label="User action navigation"
      >
        <div
          role="tablist"
          aria-owns={`${displayedTabs
            .map((tab) => tab.toLowerCase().replace(" ", "-") + "-tab-id")
            .join(" ")}`}
          className="usa-nav__secondary-links prime-nav usa-list"
        >
          {displayedTabs.map((tab) => (
            <div
              className={`usa-nav__secondary-item ${
                navItemSelected === tab ? "usa-current" : ""
              }`}
              key={tab.toLowerCase().replace(" ", "-") + "-key"}
            >
              <button
                id={`${tab.toLowerCase().replace(" ", "-")}-tab-id`}
                role="tab"
                className="usa-button--unstyled text-ink text-no-underline"
                onClick={() => setNavItemSelected(tab)}
                aria-selected={navItemSelected === tab}
              >
                {tab}
              </button>
            </div>
          ))}
        </div>
      </nav>
      {availableTabs[navItemSelected]}
    </div>
  );
};

export default UserDetail;
