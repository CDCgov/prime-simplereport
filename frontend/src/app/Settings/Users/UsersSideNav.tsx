import React, { Dispatch } from "react";
import classnames from "classnames";

import { ReactComponent as DeactivatedIcon } from "../../../img/account-deactivated.svg";
import { ReactComponent as PendingIcon } from "../../../img/account-pending.svg";
import { displayFullName } from "../../utils";
import { formatUserStatus } from "../../utils/text";
import { OktaUserStatus } from "../../utils/user";
import "./ManageUsers.scss";
import SearchInput from "../../testQueue/addToQueue/SearchInput";

import { LimitedUser } from "./ManageUsersContainer";

interface Props {
  activeUserId: string;
  users: LimitedUser[];
  onChangeActiveUser: (userId: string) => void;
  debouncedQueryString: string;
  setDebouncedQueryString: Dispatch<string>;
}

const UsersSideNav: React.FC<Props> = ({
  activeUserId,
  users,
  onChangeActiveUser,
  debouncedQueryString,
  setDebouncedQueryString,
}) => {
  const getIdsAsString = (users: LimitedUser[]) => {
    return users.map((user) => "user-tab-" + user.id.toString()).join(" ");
  };

  return (
    <div className="display-block users-sidenav">
      <h2 className="users-sidenav-header">Users</h2>
      <SearchInput
        onInputChange={(e) => setDebouncedQueryString(e.target.value)}
        disabled={true}
        queryString={debouncedQueryString}
        placeholder={`Search by name`}
        showSubmitButton={false}
      />
      <nav
        className="prime-secondary-nav maxh-tablet-lg overflow-y-scroll"
        aria-label="Tertiary navigation"
      >
        <div
          role="tablist"
          aria-owns={getIdsAsString(users)}
          className="usa-sidenav"
        >
          {users.length === 0 && (
            <div className={"usa-sidenav__item users-sidenav-item"}>
              <div className={"padding-105 padding-right-2 padding-left-3"}>
                No results found.
              </div>
            </div>
          )}
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
