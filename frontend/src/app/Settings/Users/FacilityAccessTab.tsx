import React from "react";

import Button from "../../commonComponents/Button/Button";
import { Role } from "../../permissions";
import Prompt from "../../utils/Prompt";

import { SettingsUser, UserFacilitySetting } from "./ManageUsersContainer";
import UserRoleSettingsForm from "./UserRoleSettingsForm";
import UserFacilitiesSettingsForm from "./UserFacilitiesSettingsForm";
import { UserDetailTab } from "./UserDetail";

const roles: Role[] = ["ADMIN", "ENTRY_ONLY", "USER"];

interface FacilityAccessTabProps {
  user: SettingsUser;
  loggedInUser: User;
  updateUser: <K extends keyof SettingsUser>(
    key: K,
    value: SettingsUser[K]
  ) => void;
  allFacilities: UserFacilitySetting[];
  handleUpdateUser: () => void;
  isUpdating: boolean;
  isUserEdited: boolean;
}
export const FacilityAccessTab: React.FC<FacilityAccessTabProps> = ({
  user,
  loggedInUser,
  updateUser,
  allFacilities,
  handleUpdateUser,
  isUpdating,
  isUserEdited,
}) => {
  return (
    <>
      <div
        role="tabpanel"
        aria-labelledby={`${UserDetailTab.facilityAccess
          .toLowerCase()
          .replace(" ", "-")}facility-access-tab-id`}
        className="padding-left-1"
      >
        <h3 className="basic-info-header margin-bottom-1">User role</h3>
        <div className="userrole-subtext">
          Admins have full access to use and change settings on SimpleReport.
          Standard and testing-only users have limited access for specific
          tasks, as described below.
        </div>
        <UserRoleSettingsForm
          activeUser={user}
          loggedInUser={loggedInUser}
          onUpdateUser={updateUser}
        />
        <UserFacilitiesSettingsForm
          activeUser={user}
          allFacilities={allFacilities}
          onUpdateUser={updateUser}
        />
        <div className="usa-card__footer display-flex flex-justify margin-top-5 padding-x-0">
          <Button
            type="button"
            variant="outline"
            className="margin-left-auto"
            onClick={handleUpdateUser}
            label={isUpdating ? "Saving..." : "Save changes"}
            disabled={
              !user.role ||
              !roles.includes(user.role) ||
              user?.organization?.testingFacility.length === 0 ||
              !isUserEdited ||
              !["Admin user", "Admin user (SU)"].includes(
                loggedInUser.roleDescription
              ) ||
              isUpdating
            }
          />
        </div>
      </div>
      {isUserEdited && (
        <Prompt
          when={isUserEdited}
          message="You have unsaved changes. Do you want to continue?"
        />
      )}
    </>
  );
};
