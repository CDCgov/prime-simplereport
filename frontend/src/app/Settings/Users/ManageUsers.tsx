import React, { useState } from "react";
import Nav from "../Nav";
import Button from "../../commonComponents/Button";
import Dropdown from "../../commonComponents/Dropdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ConditionalWrap from "../../commonComponents/ConditionalWrap";
import Checkboxes from "../../commonComponents/Checkboxes";
import Alert from "../../commonComponents/Alert";
import "./ManageUsers.scss";
import { UserRole } from "../../permissions";
import { showNotification } from "../../utils";
import { toast } from "react-toastify";

interface Props {
  currentUser: any;
  users: any[]; // TODO
}

const dummyUsers = {
  "123": {
    id: "123",
    name: "Peter Parker",
    role: "admin",
    isAdmin: true,
    email: "spider@hero.com",
  },
  "456": {
    id: "456",
    name: "Carol Danvers",
    role: "user",
    isAdmin: false,
    email: "marvel@hero.com",
  },
  "789": {
    id: "789",
    name: "Natasha Romanoff",
    role: "admin",
    isAdmin: true,
    email: "widow@hero.com",
    isCurrentUser: true,
  },
} as SettingsUsers;

interface SettingsUser {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  isAdmin: boolean;
  isEdited?: boolean;
  isCurrentUser?: boolean;
}

type SettingsUsers = { [id: string]: SettingsUser };

const ManageUsers: React.FC<Props> = ({ users, currentUser }) => {
  const [usersState, updateUsersState] = useState<SettingsUsers>(dummyUsers);
  const [activeUser, updateActiveUser] = useState<any>(
    Object.keys(dummyUsers)[0]
  ); // pick the first user

  // const onDropdownChange = (
  //   e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  //   userId: string
  // ) => {
  //   updateUsersState({
  //     ...usersState,
  //     [userId]: {
  //       ...usersState[userId],
  //       role: e.target.value,
  //     },
  //   });
  // };

  const changeIsAdmin = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    userId: string
  ) => {
    // let role = e.target.value as UserRole;
    let isAdmin = usersState[userId].isAdmin;
    updateUsersState({
      ...usersState,
      [userId]: {
        ...usersState[userId],
        isAdmin: !isAdmin,
        isEdited: true,
      },
    });
  };

  const onSaveChanges = (userId: string) => {
    // TODO: make graphql mututation to save query

    updateUsersState({
      ...usersState,
      [userId]: {
        ...usersState[userId],
        isEdited: false,
      },
    });

    let successAlert = (
      <Alert
        type="success"
        title="Updated User"
        body={`${usersState[userId].name}'s settings have been saved`}
      />
    );

    showNotification(toast, successAlert);
  };

  const onChangeActiveUser = (nextActiveUserId: string) => {
    if (usersState[activeUser].isEdited) {
      let warningAlert = (
        <Alert
          type="warning"
          title={`${usersState[activeUser].name}'s settings have changed`}
          body={`Please save or reset changes to continue`}
        />
      );
      showNotification(toast, warningAlert);
    } else {
      updateActiveUser(nextActiveUserId);
    }
  };

  const sideNavItems = Object.values(usersState).map((user: any) => {
    return (
      <li
        className="usa-sidenav__item"
        onClick={() => onChangeActiveUser(user.id)}
      >
        <ConditionalWrap
          condition={activeUser === user.id}
          wrap={(children) => <div className="usa-current">{children}</div>}
        >
          <a className="padding-left-2 padding-right-2">
            {user.name}
            <br />
            {user.email}
          </a>
        </ConditionalWrap>
      </li>
    );
  });

  const resetUser = (userId: string) => {
    updateUsersState({
      ...usersState,
      [userId]: dummyUsers[userId],
    });
  };

  const userDetail = (user: SettingsUser, currentUser: any) => {
    // TODO update currentUser type
    return (
      <React.Fragment>
        <div className="user-header">
          <h2 className="display-inline-block"> {user.name} </h2>{" "}
          {user.id === currentUser.id ? (
            <span className="usa-tag margin-left-1">YOU</span>
          ) : null}
        </div>
        <div className="user-content">
          <p>
            Permissions to manage settings and users are limited to admins only
          </p>
          <Checkboxes
            boxes={[
              {
                value: "admin",
                label: "Admin",
                checked: user.isAdmin,
              },
            ]}
            legend="Set default"
            legendSrOnly
            required={false}
            name="user role"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              changeIsAdmin(e, user.id)
            }
            disabled={!currentUser.isAdmin}
          />
          <div className="float-right">
            <Button
              type="button"
              onClick={() => onSaveChanges(user.id)}
              label="Save Changes"
              disabled={!currentUser.isAdmin || !usersState[user.id].isEdited}
            />
            <Button
              variant="unstyled"
              className="reset-button"
              onClick={() => resetUser(user.id)}
              label="Reset"
            />
          </div>
        </div>
      </React.Fragment>
    );
  };

  // const userRows = Object.values(usersState).map((user: any) => {
  //   let role = isUserEditable[user.id] ? (
  //     <Dropdown
  //       selectedValue={user.role}
  //       onChange={(e) => onDropdownChange(e, user.id)}
  //       options={[
  //         { label: "Admin", value: "Admin" },
  //         { label: "User", value: "User" },
  //         { label: "Entry Only", value: "Entry Only" },
  //       ]}
  //     />
  //   ) : user.isCurrentUser ? (
  //     <div>
  //       <span>{user.role} </span>
  //       <span className="usa-tag">YOU</span>
  //     </div>
  //   ) : (
  //     <span>{user.role}</span>
  //   );

  //   return (
  //     <tr key={user.id}>
  //       <td>{user.name}</td>
  //       <td>{user.email}</td>
  //       <td>{role}</td>
  //       <td>
  //         {!user.isCurrentUser ? (
  //           <div
  //             onClick={() => {
  //               updateIsUserEditable({ ...isUserEditable, [user.id]: true });
  //             }}
  //           >
  //             <FontAwesomeIcon icon={"edit"} />
  //           </div>
  //         ) : null}
  //       </td>
  //     </tr>
  //   );
  // });

  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="prime-container usa-card__container">
          <div className="usa-card__header">
            <h2>Manage Users</h2>
          </div>
          <div className="usa-card__body">
            <div className="grid-row">
              <div className="display-block users-sidenav">
                <h2>Users</h2>
                <ul className="usa-sidenav">{sideNavItems}</ul>
              </div>
              <div className="tablet:grid-col">
                {userDetail(usersState[activeUser], currentUser)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ManageUsers;
