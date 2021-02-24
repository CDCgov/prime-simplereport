import React from "react";

import RadioGroup from "../../commonComponents/RadioGroup";
import { SettingsUser } from "./ManageUsersContainer";
import { RoleDescription } from "../../permissions";

interface RoleButton {
  value: RoleDescription;
  label: string;
}

const ROLES: RoleButton[] = [
  {
    value: "Admin user",
    label: "Admin (full permissions)",
  },
  {
    value: "Standard user",
    label: "Standard user (manage results and profiles)",
  },
  {
    value: "Test-entry user",
    label: "Entry only (conduct tests)",
  },
];

interface Props {
  activeUser: SettingsUser; // the user you are currently attempting to edit
  loggedInUser: User; // the user doing the editing
  onUpdateUser<RoleDescription>(
    userId: string,
    key: string,
    value: RoleDescription
  ): void;
}

const UserRoleSettingsForm: React.FC<Props> = ({
  activeUser,
  loggedInUser,
  onUpdateUser,
}) => {
  const updateRole = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const role = e.target.value as RoleDescription;
    onUpdateUser(activeUser.id, e.target.name, role);
  };

  return (
    <React.Fragment>
      <RadioGroup
        className="margin-top-neg-1 margin-bottom-4"
        legend="Roles"
        legendSrOnly
        name="roleDescription"
        buttons={ROLES}
        selectedRadio={activeUser.roleDescription}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateRole(e)}
        disabled={
          activeUser.id === loggedInUser.id ||
          process.env.REACT_APP_EDIT_USER_ROLE === "false"
        }
      />
    </React.Fragment>
  );
};

export default UserRoleSettingsForm;
