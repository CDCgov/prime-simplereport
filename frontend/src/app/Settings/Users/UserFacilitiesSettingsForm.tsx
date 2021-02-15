import React from "react";

import { SettingsUser } from "./ManageUsersContainer";
import { UserRole } from "../../permissions";
import Dropdown from "../../commonComponents/Dropdown";

interface Props {
  activeUser: SettingsUser; // the user you are currently attempting to edit
  onUpdateUser<UserRole>(userId: string, key: string, value: UserRole): void;
}

const UserFacilitiesSettingsForm: React.FC<Props> = ({
  activeUser,
  onUpdateUser,
}) => {
  const updateRole = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const role = e.target.value as UserRole;
    onUpdateUser(activeUser.id, "role", role);
  };

  // TODO: this operates similarly to adding devices in the facility settings
  const onFacilityChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    facilityId: string
  ) => {
    // let newFacilityId = e.target.value;
  };

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
      disabled={activeUser.role === "admin"}
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

export default UserFacilitiesSettingsForm;
