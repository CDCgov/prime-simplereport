import React from "react";
import classnames from "classnames";

import { ReactComponent as DeactivatedIcon } from "../../../img/account-deactivated.svg";
import { ReactComponent as PendingIcon } from "../../../img/account-pending.svg";
import { displayFullName } from "../../utils";
import { formatUserStatus } from "../../utils/text";
import { OktaUserStatus } from "../../utils/user";

import { LimitedUser } from "./ManageUsersContainer";

import "./ManageUsers.scss";

interface Props {
  activeUserId: string;
  users: LimitedUser[];
  onChangeActiveUser: (userId: string) => void;
}

const UsersSideNav: React.FC<Props> = ({
  activeUserId,
  users,
  onChangeActiveUser,
}) => {
  const getIdsAsString = (users: LimitedUser[]) => {
    return users.map((user) => "user-tab-" + user.id.toString()).join(" ");
  };

  return (
    <div className="display-block users-sidenav">
      <h2 className="users-sidenav-header">Users</h2>
      <nav className="prime-secondary-nav" aria-label="Tertiary navigation">
        <div
          role="tablist"
          aria-owns={getIdsAsString(users)}
          className="usa-sidenav"
        >
          {users.map((user: LimitedUser) => {
            let statusText;

            switch (user.status) {
              case OktaUserStatus.ACTIVE:
                statusText = (
                  <span className="sidenav-user-status padding-left-0"></span>
                );
                break;
              case OktaUserStatus.PROVISIONED:
                statusText = (
                  <>
                    <PendingIcon />
                    <span className="sidenav-user-status">
                      {formatUserStatus(user.status)}
                    </span>
                  </>
                );
                break;
              case OktaUserStatus.SUSPENDED:
                statusText = (
                  <>
                    <DeactivatedIcon />
                    <span className="sidenav-user-status">
                      {formatUserStatus(user.status)}
                    </span>
                  </>
                );
                break;
              default:
                statusText = "";
            }
            return (
              <div
                className="usa-sidenav__item users-sidenav-item"
                key={user.id}
              >
                <button
                  id={"user-tab-" + user.id}
                  role="tab"
                  style={{ cursor: "pointer" }}
                  className={classnames(
                    "usa-button--unstyled",
                    "text-ink",
                    "text-no-underline",
                    "padding-105 padding-right-2 padding-left-3",
                    activeUserId === user.id && "usa-current"
                  )}
                  aria-label={displayFullName(
                    user.firstName,
                    user.middleName,
                    user.lastName
                  )}
                  aria-selected={activeUserId === user.id}
                  onClick={() => onChangeActiveUser(user.id)}
                  key={user.id}
                >
                  <div className="sidenav-user-name">
                    {displayFullName(
                      user.firstName,
                      user.middleName,
                      user.lastName
                    )}
                  </div>
                  {statusText}
                </button>
              </div>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default UsersSideNav;
