import React from "react";
import classnames from "classnames";

import { displayFullName } from "../../utils";
import { SettingsUsers } from "./ManageUsers";
import { SettingsUser } from "./ManageUsersContainer";

import "./ManageUsers.scss";

interface Props {
  activeUserId: string;
  users: SettingsUsers;
  onChangeActiveUser: (userId: string) => void;
}

const UsersSideNav: React.FC<Props> = ({
  activeUserId,
  users,
  onChangeActiveUser,
}) => {
  return (
    <div className="display-block users-sidenav">
      <h3>Users</h3>
      <ul className="usa-sidenav">
        {Object.values(users).map((user: SettingsUser) => {
          return (
            <li
              className="usa-sidenav__item users-sidenav-item"
              onClick={() => onChangeActiveUser(user.id)}
              key={user.id}
            >
              <div
                className={classnames(
                  "padding-105 padding-right-2",
                  activeUserId === user.id && "usa-current"
                )}
              >
                <span className="sidenav-user-name">
                  {displayFullName(
                    user.firstName,
                    user.middleName,
                    user.lastName
                  )}
                </span>
                <br />
                <span className="sidenav-user-email">{user.email}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default UsersSideNav;
