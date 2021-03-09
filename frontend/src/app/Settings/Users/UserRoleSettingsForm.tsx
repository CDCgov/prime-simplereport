import React from "react";

import RadioGroup from "../../commonComponents/RadioGroup";
import { OrganizationRole } from "../../permissions";

import { UpdateUser } from "./ManageUsers";
import { SettingsUser } from "./ManageUsersContainer";

interface RoleButton {
  value: OrganizationRole;
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

const organizationRoles = new Set(ROLES.map(({ value }) => value));
organizationRoles.add("MEMBER");

const getUserOrganizationalRole = (user: SettingsUser) => {
  return user.roles.includes("ADMIN")
    ? "ADMIN"
    : user.roles.includes("ENTRY_ONLY")
    ? "ENTRY_ONLY"
    : "USER";
};

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
  const updateRole = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const role = e.target.value as OrganizationRole;
    // Don't want to lose facility-related roles
    const updatedRoles = activeUser.roles.filter(
      (role) => !organizationRoles.has(role)
    );
    updatedRoles.push(role);
    onUpdateUser(activeUser.id, "roles", updatedRoles);
  };

  return (
    <React.Fragment>
      <RadioGroup
        className="margin-top-neg-1 margin-bottom-4"
        legend="Roles"
        legendSrOnly
        name="role"
        buttons={ROLES}
        selectedRadio={getUserOrganizationalRole(activeUser)}
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
