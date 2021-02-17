import React from "react";

import RadioGroup from "../../commonComponents/RadioGroup";
import { SettingsUser } from "./ManageUsersContainer";
import { UserRole } from "../../permissions";

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
  activeUser: SettingsUser; // the user you are currently attempting to edit
  loggedInUser: User; // the user doing the editing
  onUpdateUser<UserRole>(userId: string, key: string, value: UserRole): void;
}

const UserRoleSettingsForm: React.FC<Props> = ({
  activeUser,
  loggedInUser,
  onUpdateUser,
}) => {
  const updateRole = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const role = e.target.value as UserRole;
    onUpdateUser(activeUser.id, e.target.name, role);
  };

  return (
    <React.Fragment>
      <RadioGroup
        legend="Roles"
        legendSrOnly
        name="role"
        buttons={ROLES}
        selectedRadio={activeUser.role}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateRole(e)}
        disabled={activeUser.id === loggedInUser.id}
      />
    </React.Fragment>
  );
};

export default UserRoleSettingsForm;
