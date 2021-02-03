import React, { useState } from "react";
import Nav from "../Nav";
import Button from "../../commonComponents/Button";
import Dropdown from "../../commonComponents/Dropdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ConditionalWrap from "../../commonComponents/ConditionalWrap";

interface Props {
  users: any[]; // TODO
}

const dummyUsers = {
  "123": {
    id: "123",
    name: "Peter Parker",
    role: "Admin",
    email: "spider@hero.com",
  },
  "456": {
    id: "456",
    name: "Carol Danvers",
    role: "User",
    email: "marvel@hero.com",
  },
  "789": {
    id: "789",
    name: "Natasha Romanoff",
    role: "Admin",
    email: "widow@hero.com",
    isCurrentUser: true,
  },
};

// const ActiveNav: React.FC<Props> = (children) => {};

const ManageUsers: React.FC<Props> = ({ users }) => {
  // TODO: this is all garbage code
  const [usersState, updateUsersState] = useState<any>(dummyUsers);
  const [isUserEditable, updateIsUserEditable] = useState<any>({
    "123": false,
    "456": false,
    "789": false,
  });

  const onDropdownChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    userId: string
  ) => {
    updateUsersState({
      ...usersState,
      [userId]: {
        ...usersState[userId],
        role: e.target.value,
      },
    });
  };

  const onSaveChanges = () => {
    updateIsUserEditable({
      "123": false,
      "456": false,
      "789": false,
    });
  };

  const sideNavItems = Object.values(usersState).map((user: any) => {
    return (
      <li className="usa-sidenav__item">
        <ConditionalWrap
          condition={user.isCurrentUser}
          wrap={(children) => (
            <a href="" className="usa-current">
              {children}
            </a>
          )}
        >
          {user.name}
          <br />
          {user.email}
        </ConditionalWrap>
      </li>
    );
  });

  const userDetail = (user: any) => {
    return (
      <div>
        <span className="usa-tag">YOU</span>
        <h2> {user.name} </h2>
      </div>
    );
  };

  const userRows = Object.values(usersState).map((user: any) => {
    let role = isUserEditable[user.id] ? (
      <Dropdown
        selectedValue={user.role}
        onChange={(e) => onDropdownChange(e, user.id)}
        options={[
          { label: "Admin", value: "Admin" },
          { label: "User", value: "User" },
          { label: "Entry Only", value: "Entry Only" },
        ]}
      />
    ) : user.isCurrentUser ? (
      <div>
        <span>{user.role} </span>
        <span className="usa-tag">YOU</span>
      </div>
    ) : (
      <span>{user.role}</span>
    );

    return (
      <tr key={user.id}>
        <td>{user.name}</td>
        <td>{user.email}</td>
        <td>{role}</td>
        <td>
          {!user.isCurrentUser ? (
            <div
              onClick={() => {
                updateIsUserEditable({ ...isUserEditable, [user.id]: true });
              }}
            >
              <FontAwesomeIcon icon={"edit"} />
            </div>
          ) : null}
        </td>
      </tr>
    );
  });

  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="prime-container usa-card__container">
          <div className="usa-card__header">
            <h2>Manage Users</h2>
            <Button
              type="button"
              onClick={onSaveChanges}
              label="Save Changes"
            />
          </div>
          <div className="usa-card__body">
            <div className="grid-row">
              <div className="display-block">
                <h3>Users</h3>
                <ul className="usa-sidenav">{sideNavItems}</ul>
              </div>
              <div className="display-block">
                <table className="usa-table usa-table--borderless width-full">
                  <thead>
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Email</th>
                      <th scope="col">Role</th>
                    </tr>
                  </thead>
                  <tbody>{userRows}</tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ManageUsers;
