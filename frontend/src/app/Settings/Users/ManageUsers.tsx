import React, { useState } from "react";
import Button from "../../commonComponents/Button";
// import Dropdown from "../../commonComponents/Dropdown";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ConditionalWrap from "../../commonComponents/ConditionalWrap";
// import Checkboxes from "../../commonComponents/Checkboxes";
import Alert from "../../commonComponents/Alert";
import "./ManageUsers.scss";
import { UserRole } from "../../permissions";
import { showNotification } from "../../utils";
import { toast } from "react-toastify";
import InProgressModal from "./InProgerssModal";
import RadioGroup from "../../commonComponents/RadioGroup";

interface RoleButton {
  value: UserRole;
  label: string;
}

const ROLES: RoleButton[] = [
  {
    value: "admin",
    label: "Admin",
  },
  {
    value: "user",
    label: "User",
  },
  {
    value: "entry-only",
    label: "Entry Only",
  },
];

interface SettingsUser {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  isAdmin: boolean;
  isEdited?: boolean;
}

interface Props {
  currentUser: any; // TODO: this is a subset of the whoami user
  users: SettingsUser[];
}

type SettingsUsers = { [id: string]: SettingsUser };

const ManageUsers: React.FC<Props> = ({ users, currentUser }) => {
  let settingsUsers: SettingsUsers = users.reduce(
    (acc: SettingsUsers, user: SettingsUser) => {
      acc[user.id] = user;
      return acc;
    },
    {}
  );

  const [usersState, updateUsersState] = useState<SettingsUsers>(settingsUsers);
  const [activeUser, updateActiveUser] = useState<any>(
    Object.keys(settingsUsers)[0]
  ); // pick the first user
  const [nextActiveUser, updateNextActiveUser] = useState<string | null>(null);
  const [showInProgressModal, updateShowInProgressModal] = useState(false);

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

  const changeRole = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    userId: string
  ) => {
    let role = e.target.value as UserRole;
    updateUsersState({
      ...usersState,
      [userId]: {
        ...usersState[userId],
        role: role,
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
        title="Changes Saved"
        body={`${usersState[userId].name}'s settings have been saved`}
      />
    );

    showNotification(toast, successAlert);
  };

  const onChangeActiveUser = (nextActiveUserId: string) => {
    if (usersState[activeUser].isEdited) {
      updateNextActiveUser(nextActiveUserId);
      updateShowInProgressModal(true);
    } else {
      updateActiveUser(nextActiveUserId);
    }
  };

  const onContinueChangeActiveUser = (currentActiveUserId: string) => {
    updateShowInProgressModal(false);
    updateActiveUser(nextActiveUser);
    resetUser(currentActiveUserId);
  };

  const sideNavItems = Object.values(usersState).map((user: any) => {
    return (
      <li
        className="usa-sidenav__item users-sidenav-item"
        onClick={() => onChangeActiveUser(user.id)}
      >
        <ConditionalWrap
          condition={activeUser === user.id}
          wrap={(children) => <div className="usa-current">{children}</div>}
        >
          <a className="padding-left-2 padding-right-2">
            <span className="sidenav-user-name">{user.name}</span>
            <br />
            <span className="sidenav-user-email">{user.email}</span>
          </a>
        </ConditionalWrap>
      </li>
    );
  });

  const resetUser = (userId: string) => {
    updateUsersState({
      ...usersState,
      [userId]: settingsUsers[userId],
    });
  };

  const userDetail = (user: SettingsUser, currentUser: any) => {
    // TODO update currentUser type
    return (
      <React.Fragment>
        <div className="user-header">
          <h2 className="display-inline-block margin-top-2 margin-bottom-105">
            {" "}
            {user.name}{" "}
          </h2>{" "}
          {user.id === currentUser.id ? (
            <span className="usa-tag margin-left-1">YOU</span>
          ) : null}
        </div>
        <div className="user-content">
          <p>
            Permissions to manage settings and users are limited to admins only
          </p>
          <RadioGroup
            legend="Roles"
            // required
            legendSrOnly
            name="role"
            buttons={ROLES}
            selectedRadio={user.role}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              changeRole(e, user.id)
            }
          />
          {/* <Checkboxes
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
          /> */}
          <div className="float-right">
            <Button
              type="button"
              onClick={() => onSaveChanges(user.id)}
              label="Save changes"
              disabled={!currentUser.isAdmin || !usersState[user.id].isEdited}
            />
            {/* <Button
              variant="unstyled"
              className="reset-button"
              onClick={() => resetUser(user.id)}
              label="Reset"
            /> */}
          </div>
        </div>
        {showInProgressModal ? (
          <InProgressModal
            onClose={() => updateShowInProgressModal(false)}
            onContinue={() => onContinueChangeActiveUser(user.id)}
            // overlayClassName="prime-modal-overlay"
            // contentLabel="Time of Test Questions"
          ></InProgressModal>
        ) : null}
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
                <h3>Users</h3>
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
