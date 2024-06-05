import React, { useEffect, useMemo } from "react";

import Checkboxes from "../../commonComponents/Checkboxes";
import { UserPermission } from "../../../generated/graphql";

import { UpdateUser } from "./ManageUsers";
import { SettingsUser, UserFacilitySetting } from "./ManageUsersContainer";

import "./ManageUsers.scss";

type FacilityLookup = Record<string, UserFacilitySetting>;

const getHasAllFacilityAccess = (user: Partial<SettingsUser>) =>
  user.role === "ADMIN" ||
  user.permissions?.includes(UserPermission.AccessAllFacilities);

export const alphabeticalFacilitySort = (
  a: UserFacilitySetting,
  b: UserFacilitySetting
) => {
  if (a.name === b.name) {
    return 0;
  }
  return a.name > b.name ? 1 : -1;
};

interface Props {
  activeUser: Partial<SettingsUser>; // the user you are currently attempting to edit
  allFacilities: UserFacilitySetting[]; // all facilities for the entire org; the activeUser would have a subset of these
  onUpdateUser: UpdateUser;
  showRequired?: boolean;
}

const UserFacilitiesSettingsForm: React.FC<Props> = ({
  activeUser,
  allFacilities,
  onUpdateUser,
  showRequired,
}) => {
  const facilityLookup: FacilityLookup = useMemo(
    () =>
      allFacilities.reduce((acc, { id, name }) => {
        acc[id] = { id, name };
        return acc;
      }, {} as FacilityLookup),
    [allFacilities]
  );

  const onRemoveFacility = (
    activeUser: Partial<SettingsUser>,
    selectedFacilityId: string
  ) => {
    onUpdateUser("organization", {
      testingFacility:
        activeUser.organization?.testingFacility.filter(
          (f) => f.id !== selectedFacilityId
        ) || [],
    });
  };

  const isAdmin = activeUser.role === "ADMIN";

  const facilityAccessDescription = isAdmin
    ? "Admins have access to all facilities"
    : "All users must have access to at least one facility";

  const hasAllFacilityAccess = useMemo(
    () => getHasAllFacilityAccess(activeUser),
    [activeUser]
  );

  useEffect(() => {
    if (
      hasAllFacilityAccess &&
      activeUser.organization?.testingFacility.length !== allFacilities.length
    ) {
      onUpdateUser("organization", {
        testingFacility: allFacilities.map(({ id, name }) => ({ id, name })),
      });
    }
  }, [hasAllFacilityAccess, activeUser, onUpdateUser, allFacilities]);

  const userFacilities = useMemo(() => {
    if (hasAllFacilityAccess) {
      return [...allFacilities];
    } else if (activeUser.organization) {
      return [...activeUser.organization.testingFacility];
    } else {
      return [];
    }
  }, [activeUser, allFacilities, hasAllFacilityAccess]);

  userFacilities.sort(alphabeticalFacilitySort);

  const userFacilityLookup = useMemo(
    () => new Set(userFacilities.map(({ id }) => id)),
    [userFacilities]
  );

  const boxes = [
    {
      value: "ALL_FACILITIES",
      label: `Access all facilities (${allFacilities.length})`,
      disabled: isAdmin,
      checked: hasAllFacilityAccess,
    },
    ...allFacilities.map((facility) => ({
      value: facility.id,
      label: facility.name,
      disabled: isAdmin,
      checked: userFacilityLookup.has(facility.id),
    })),
  ];

  return (
    <>
      <h4 className="testing-facility-access-subheader margin-bottom-0">
        Testing facility access{" "}
        {showRequired && <span className="text-secondary-vivid">*</span>}
      </h4>
      <p className="testing-facility-access-subtext">
        {facilityAccessDescription}
      </p>
      <Checkboxes
        boxes={boxes}
        legend="Facilities"
        legendSrOnly
        name="facilities-settings-form"
        onChange={(e) => {
          const { value, checked } = e.target;
          if (value === "ALL_FACILITIES") {
            if (checked) {
              onUpdateUser("permissions", [
                ...(activeUser.permissions || []),
                UserPermission.AccessAllFacilities,
              ]);
            } else {
              onUpdateUser(
                "permissions",
                activeUser.permissions?.filter(
                  (permission) => permission !== "ACCESS_ALL_FACILITIES"
                ) || []
              );
            }
          } else {
            if (checked) {
              const facility = facilityLookup[value];
              onUpdateUser("organization", {
                testingFacility: [
                  ...(activeUser.organization?.testingFacility || []),
                  facility,
                ],
              });
            } else {
              onRemoveFacility(activeUser, value);
            }
          }
        }}
      />
    </>
  );
};

export default UserFacilitiesSettingsForm;
