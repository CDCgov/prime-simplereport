import React from "react";
import classnames from "classnames";

import { ReactComponent as DeactivatedIcon } from "../../../img/account-deactivated.svg";
import { ReactComponent as PendingIcon } from "../../../img/account-pending.svg";
import { displayFullName } from "../../utils";
import { formatUserStatus } from "../../utils/text";

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
  return (
    <div className="display-block users-sidenav">
      <h3 className="users-header">Users</h3>
      <ul className="usa-sidenav">
        {users.map((user: LimitedUser) => {
          let statusText;
          switch (user.status) {
            case "ACTIVE":
              statusText = (
                <span className="sidenav-user-status padding-left-0">
                  User role
                </span>
              );
              break;
            case "PROVISIONED":
              statusText = (
                <>
                  <PendingIcon />
                  <span className="sidenav-user-status">
                    {formatUserStatus(user.status)}
                  </span>
                </>
              );
              break;
            case "SUSPENDED":
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
            <li
              className="usa-sidenav__item users-sidenav-item"
              onClick={() => onChangeActiveUser(user.id)}
              key={user.id}
            >
              <button
                role="tab"
                style={{ cursor: "pointer" }}
                className={classnames(
                  "usa-button--unstyled",
                  "text-ink",
                  "text-no-underline",
                  "padding-105 padding-right-2 padding-left-3",
                  activeUserId === user.id && "usa-current"
                )}
                aria-selected={activeUserId === user.id}
                aria-label={displayFullName(
                  user.firstName,
                  user.middleName,
                  user.lastName
                )}
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
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default UsersSideNav;
