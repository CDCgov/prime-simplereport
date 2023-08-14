import React, { useState } from "react";

import { displayFullName } from "../../utils";
import Button from "../../commonComponents/Button/Button";
import { capitalizeText, formatUserStatus } from "../../utils/text";
import { ReactComponent as DeactivatedIcon } from "../../../img/account-deactivated.svg";
import { ReactComponent as PendingIcon } from "../../../img/account-pending.svg";
import Prompt from "../../utils/Prompt";
import { OktaUserStatus } from "../../utils/user";
import Alert from "../../commonComponents/Alert";

import { SettingsUser, UserFacilitySetting } from "./ManageUsersContainer";
import { UpdateUser } from "./ManageUsers";
import DeleteUserModal from "./DeleteUserModal";
import ReactivateUserModal from "./ReactivateUserModal";
import ResendActivationEmailModal from "./ResendActivationEmailModal";
import ResetUserPasswordModal from "./ResetUserPasswordModal";
import EditUserNameModal from "./EditUserNameModal";
import EditUserEmailModal from "./EditUserEmailModal";
import ResetUserMfaModal from "./ResetUserMfaModal";
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
  userStatus: string;
  isUpdating: boolean;
  updateShowReactivateUserModal: (showReactivateUserModal: boolean) => void;
  updateShowResendUserActivationEmailModal: (
    showResendUserActivationEmail: boolean
  ) => void;
}> = ({
  user,
  isUpdating,
  updateShowReactivateUserModal,
  updateShowResendUserActivationEmailModal,
}) => {
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
  const [showDeleteUserModal, updateShowDeleteUserModal] = useState(false);
  const [showReactivateUserModal, updateShowReactivateUserModal] =
    useState(false);
  const [showResetMfaModal, updateShowResetMfaModal] = useState(false);
  const [showEditUserNameModal, updateEditUserNameModal] = useState(false);
  const [showEditUserEmailModal, updateEditUserEmailModal] = useState(false);
  const [showResetPasswordModal, updateShowResetPasswordModal] =
    useState(false);
  const [
    showResendUserActivationEmailModal,
    updateShowResendUserActivationEmailModal,
  ] = useState(false);

  const isUserActive = () =>
    user.status !== OktaUserStatus.SUSPENDED &&
    user.status !== OktaUserStatus.PROVISIONED &&
    !user.isDeleted;

  const isUserSelf = () => user.id === loggedInUser.id;

  function displayYou() {
    if (isUserSelf()) {
      return (
        <span className="usa-tag margin-left-1 bg-base-lighter text-ink">
          YOU
        </span>
      );
    }
    return null;
  }

  const availableTabs = {
    [UserDetailTab.userInfo]: (
      <UserInfoTab
        isUserActive={isUserActive}
        user={user}
        updateEditUserNameModal={updateEditUserNameModal}
        isUpdating={isUpdating}
        updateEditUserEmailModal={updateEditUserEmailModal}
        updateShowResetPasswordModal={updateShowResetPasswordModal}
        updateShowResetMfaModal={updateShowResetMfaModal}
        isUserSelf={isUserSelf}
        updateShowDeleteUserModal={updateShowDeleteUserModal}
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
      <div>
        <h2 className="display-inline-block margin-top-1 margin-bottom-0 user-name-header">
          {displayFullName(user.firstName, user.middleName, user.lastName)}
          {displayYou()}
        </h2>
        <UserStatusSubheading user={user} />
      </div>
      <SpecialStatusNotice
        user={user}
        userStatus={user.status ?? ""}
        isUpdating={isUpdating}
        updateShowReactivateUserModal={updateShowReactivateUserModal}
        updateShowResendUserActivationEmailModal={
          updateShowResendUserActivationEmailModal
        }
      />
      <NoFacilityWarning user={user} />
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
      {isUserEdited && (
        <Prompt
          when={isUserEdited}
          message="You have unsaved changes. Do you want to continue?"
        />
      )}
      {showDeleteUserModal && (
        <DeleteUserModal
          user={user}
          onClose={() => updateShowDeleteUserModal(false)}
          onDeleteUser={handleDeleteUser}
        />
      )}
      {showReactivateUserModal && (
        <ReactivateUserModal
          user={user}
          onClose={() => updateShowReactivateUserModal(false)}
          onReactivateUser={handleReactivateUser}
        />
      )}
      {showResendUserActivationEmailModal && (
        <ResendActivationEmailModal
          user={user}
          onClose={() => updateShowResendUserActivationEmailModal(false)}
          onResendActivationEmail={handleResendUserActivationEmail}
        />
      )}
      {showResetPasswordModal && (
        <ResetUserPasswordModal
          user={user}
          onClose={() => updateShowResetPasswordModal(false)}
          onResetPassword={handleResetUserPassword}
        />
      )}
      {showResetMfaModal && (
        <ResetUserMfaModal
          user={user}
          onClose={() => updateShowResetMfaModal(false)}
          onResetMfa={handleResetUserMfa}
        />
      )}
      {showEditUserNameModal && (
        <EditUserNameModal
          user={user}
          onClose={() => updateEditUserNameModal(false)}
          onEditUserName={handleEditUserName}
        />
      )}
      {showEditUserEmailModal && (
        <EditUserEmailModal
          user={user}
          onClose={() => updateEditUserEmailModal(false)}
          onEditUserEmail={handleEditUserEmail}
        />
      )}
    </div>
  );
};

export default UserDetail;
