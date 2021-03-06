import React from "react";

import RadioGroup from "../../commonComponents/RadioGroup";
import { Role } from "../../permissions";

import { UpdateUser } from "./ManageUsers";
import { SettingsUser } from "./ManageUsersContainer";

interface RoleButton {
  value: Role;
  label: string;
}

const ROLES: RoleButton[] = [
  {
    value: "ADMIN",
    label: "Admin (full permissions)",
  },
  {
    value: "USER",
    label: "Standard user (manage results and profiles)",
  },
  {
    value: "ENTRY_ONLY",
    label: "Entry only (conduct tests)",
  },
];

interface Props {
  activeUser: SettingsUser; // the user you are currently attempting to edit
  loggedInUser: User; // the user doing the editing
  onUpdateUser: UpdateUser;
}

const UserRoleSettingsForm: React.FC<Props> = ({
  activeUser,
  loggedInUser,
  onUpdateUser,
}) => {
  const updateRole = (role: Role) => {
    onUpdateUser("role", role);
  };

  return (
    <React.Fragment>
      <RadioGroup
        className="margin-top-neg-1 margin-bottom-4"
        legend="Roles"
        legendSrOnly
        name="role"
        buttons={ROLES}
        selectedRadio={activeUser.role}
        onChange={updateRole}
        disabled={
          activeUser.id === loggedInUser.id ||
          process.env.REACT_APP_EDIT_USER_ROLE === "false"
        }
      />
    </React.Fragment>
  );
};

export default UserRoleSettingsForm;
