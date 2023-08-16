import React from "react";

import Button from "../../commonComponents/Button/Button";
import { Role } from "../../permissions";
import Prompt from "../../utils/Prompt";

import { SettingsUser, UserFacilitySetting } from "./ManageUsersContainer";
import UserRoleSettingsForm from "./UserRoleSettingsForm";
import UserFacilitiesSettingsForm from "./UserFacilitiesSettingsForm";

const roles: Role[] = ["ADMIN", "ENTRY_ONLY", "USER"];

interface FacilityAccessTabProps {
  user: SettingsUser;
  isUpdating: boolean;
  isUserEdited: boolean;
  onUpdateUser: () => void;
  updateLocalUserState: <K extends keyof SettingsUser>(
    key: K,
    value: SettingsUser[K]
  ) => void;
  loggedInUser: User;
  allFacilities: UserFacilitySetting[];
}
const FacilityAccessTab: React.FC<FacilityAccessTabProps> = ({
  user,
  isUpdating,
  isUserEdited,
  updateLocalUserState,
  onUpdateUser,
  loggedInUser,
  allFacilities,
}) => {
  return (
    <>
      <div
        role="tabpanel"
        aria-labelledby={"facility-access-tab-id"}
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
          onUpdateUser={updateLocalUserState}
        />
        <UserFacilitiesSettingsForm
          activeUser={user}
          allFacilities={allFacilities}
          onUpdateUser={updateLocalUserState}
        />
        <div className="usa-card__footer display-flex flex-justify margin-top-5 padding-x-0">
          <Button
            type="button"
            variant="outline"
            className="margin-left-auto"
            onClick={onUpdateUser}
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

export default FacilityAccessTab;
