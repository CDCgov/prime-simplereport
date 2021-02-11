import React, { useState } from "react";
import { toast } from "react-toastify";
import Alert from "../../commonComponents/Alert";
import Button from "../../commonComponents/Button";
import ConditionalWrap from "../../commonComponents/ConditionalWrap";
import InProgressModal from "./InProgressModal";
import RadioGroup from "../../commonComponents/RadioGroup";
import Dropdown from "../../commonComponents/Dropdown";
import { SettingsUser } from "./ManageUsersContainer";
import { showNotification } from "../../utils";
import { UserRole } from "../../permissions";
import "./ManageUsers.scss";

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

interface Props {
  currentUser: User;
  users: SettingsUser[];
  onUpdateUser: (user: SettingsUser) => void;
}

type SettingsUsers = { [id: string]: SettingsUser };

const ManageUsers: React.FC<Props> = ({ users, currentUser, onUpdateUser }) => {
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
    onUpdateUser(usersState[userId]); // TODO this does nothing atm

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
        key={user.id}
      >
        <ConditionalWrap
          condition={activeUser === user.id}
          wrap={(children) => <div className="usa-current">{children}</div>}
        >
          <div className="padding-105 padding-right-2">
            <span className="sidenav-user-name">{user.name}</span>
            <br />
            <span className="sidenav-user-email">{user.email}</span>
          </div>
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

  // TODO: this operates similarly to adding devices in the facility settings
  const onFacilityChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    facilityId: string
  ) => {
    let newFacilityId = e.target.value;
  };

  const userFacilitiesSettings = (user: SettingsUser) => {
    // TODO: get this from usersState
    const facilities: any[] = [
      { id: "abc", name: "Mountainside Nursing" },
      { id: "def", name: "HillsideNursing" },
      { id: "hij", name: "Lakeside Nursing" },
    ];

    let facilityOptions = facilities.map((facility: any) => ({
      label: facility.name,
      value: facility.id,
    }));

    let facilityDropdowns = facilities.map((facility) => (
      <Dropdown
        selectedValue={facility.id}
        onChange={(e) => onFacilityChange(e, facility.id)}
        disabled={user.role === "admin"} // current users have access to all facilities
        options={facilityOptions}
        key={facility.id}
      />
    ));
    return (
      <React.Fragment>
        <h3> Facility Access </h3>
        {facilityDropdowns}
      </React.Fragment>
    );
  };

  const userRoleSettings = (user: SettingsUser, currentUser: any) => {
    return (
      <React.Fragment>
        <div className="user-header">
          <h2 className="display-inline-block margin-top-2 margin-bottom-105">
            {user.name}
          </h2>
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
            legendSrOnly
            name="role"
            buttons={ROLES}
            selectedRadio={user.role}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              changeRole(e, user.id)
            }
          />
          <div className="float-right">
            <Button
              type="button"
              onClick={() => onSaveChanges(user.id)}
              label="Save changes"
              disabled={
                currentUser.roleDescription !== "Admin user" ||
                !usersState[user.id].isEdited
              }
            />
          </div>
        </div>
        {showInProgressModal ? (
          <InProgressModal
            onClose={() => updateShowInProgressModal(false)}
            onContinue={() => onContinueChangeActiveUser(user.id)}
          ></InProgressModal>
        ) : null}
      </React.Fragment>
    );
  };

  return (
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
            {userRoleSettings(usersState[activeUser], currentUser)}
            {process.env.REACT_APP_V2_ACCESS_CONTROL_ENABLED === "true"
              ? userFacilitiesSettings(usersState[activeUser])
              : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
