import React, { useRef, useState, useEffect, useMemo } from "react";

import Checkboxes from "../../commonComponents/Checkboxes";
import { UserPermission } from "../../../generated/graphql";

import { UpdateUser } from "./ManageUsers";
import { SettingsUser, UserFacilitySetting } from "./ManageUsersContainer";

import "./ManageUsers.scss";

type FacilityLookup = Record<string, UserFacilitySetting>;

const getHasAllFacilityAccess = (user: Partial<SettingsUser>) =>
  user.role === "ADMIN" ||
  user.permissions?.includes(UserPermission.AccessAllFacilities);

const alphabeticalFacilitySort = (
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
  const [isComponentVisible, setIsComponentVisible] = useState(false);

  const ref = useRef() as React.MutableRefObject<HTMLDivElement>;

  const facilityLookup: FacilityLookup = useMemo(
    () =>
      allFacilities.reduce((acc, { id, name }) => {
        acc[id] = { id, name };
        return acc;
      }, {} as FacilityLookup),
    [allFacilities]
  );

  const handleClickOutside = (event: any) => {
    // TODO: figure out this type
    if (ref.current && ref.current.contains(event.target)) {
      // inside click
      // TODO: this doesn't capture the buttons inside the table
    } else {
      // outside click
      if (isComponentVisible) {
        setIsComponentVisible(false);
      }
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  });

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

  const userFacilities = useMemo(
    () =>
      hasAllFacilityAccess
        ? [...allFacilities]
        : activeUser.organization
        ? [...activeUser.organization.testingFacility]
        : [],
    [activeUser, allFacilities, hasAllFacilityAccess]
  );

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
    },
    ...allFacilities.map((facility) => ({
      value: facility.id,
      label: facility.name,
      disabled: isAdmin,
    })),
  ];
  const checkedValues: { [key: string]: boolean | undefined } = {
    ALL_FACILITIES: hasAllFacilityAccess,
  };
  allFacilities.forEach((facility) => {
    checkedValues[facility.id] = userFacilityLookup.has(facility.id);
  });

  return (
    <>
      <h3 className="testing-facility-access-subheader margin-bottom-0">
        Testing facility access{" "}
        {showRequired && <span className="text-secondary-vivid">*</span>}
      </h3>
      <p className="testing-facility-access-subtext">
        {facilityAccessDescription}
      </p>
      <Checkboxes
        boxes={boxes}
        legend="Facilities"
        legendSrOnly
        name="facilities"
        checkedValues={checkedValues}
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
