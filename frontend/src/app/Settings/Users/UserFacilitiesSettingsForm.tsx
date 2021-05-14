import React, { useRef, useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinusCircle } from "@fortawesome/free-solid-svg-icons";
import classnames from "classnames";

import Checkboxes from "../../commonComponents/Checkboxes";
import Dropdown from "../../commonComponents/Dropdown";
import Button from "../../commonComponents/Button/Button";

import { UpdateUser } from "./ManageUsers";
import { SettingsUser, UserFacilitySetting } from "./ManageUsersContainer";

import "./ManageUsers.scss";

type FacilityLookup = Record<string, UserFacilitySetting>;

const getHasAllFacilityAccess = (user: Partial<SettingsUser>) =>
  user.role === "ADMIN" || user.permissions?.includes("ACCESS_ALL_FACILITIES");

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
  const [selectedFacility, setSelectedFacility] = useState("");

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

  const facilitiesToAdd = allFacilities
    .filter(({ id }) => !userFacilityLookup.has(id))
    .sort(alphabeticalFacilitySort);

  const removeButtonClasses = classnames(
    "remove-tag",
    "usa-button--unstyled",
    hasAllFacilityAccess && "remove-tag--disabled"
  );

  return (
    <React.Fragment>
      <h3 className="margin-bottom-0">
        Facility access{" "}
        {showRequired && <span className="text-secondary-vivid">*</span>}
      </h3>
      <p className="text-base">{facilityAccessDescription}</p>
      <Checkboxes
        boxes={[
          {
            value: "ALL_FACILITIES",
            label: "Access all facilities",
            disabled: isAdmin,
          },
        ]}
        legend="Access all facilities"
        legendSrOnly
        name="all-facilities"
        checkedValues={{ ALL_FACILITIES: hasAllFacilityAccess }}
        onChange={(e) => {
          if (e.target.checked) {
            onUpdateUser("permissions", [
              ...(activeUser.permissions || []),
              "ACCESS_ALL_FACILITIES",
            ]);
          } else {
            onUpdateUser(
              "permissions",
              activeUser.permissions?.filter(
                (permission) => permission !== "ACCESS_ALL_FACILITIES"
              ) || []
            );
          }
        }}
      />
      <table
        className="usa-table usa-table--borderless user-facilities"
        style={{ width: "100%" }}
      >
        <tbody>
          {userFacilities.length === 0 && (
            <tr>
              <td colSpan={2}>Please add at least one facility</td>
            </tr>
          )}
          {userFacilities.map((facility) => (
            <tr key={facility.id}>
              <td>{facility.name}</td>
              <td>
                <button
                  className={removeButtonClasses}
                  onClick={() => onRemoveFacility(activeUser, facility.id)}
                  disabled={hasAllFacilityAccess}
                  aria-label={`Remove facility: ${facility.name}`}
                >
                  <FontAwesomeIcon
                    icon={faMinusCircle}
                    className={"prime-red-icon"}
                  />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {hasAllFacilityAccess ? null : facilitiesToAdd.length === 0 ? (
        <p>No more facilities left to select</p>
      ) : (
        <form className="display-flex flex-align-end">
          <div>
            <label className="text-bold" htmlFor="select-facility">
              Add facility
            </label>
            <Dropdown
              id="select-facility"
              className="width-card-lg"
              options={[
                ...facilitiesToAdd.map(({ name, id }) => ({
                  label: name,
                  value: id,
                })),
              ]}
              onChange={(e) => {
                setSelectedFacility(e.target.value);
              }}
              selectedValue={selectedFacility}
              defaultSelect
              disabled={hasAllFacilityAccess}
            />
          </div>
          <Button
            className="height-5 margin-left-2"
            variant="outline"
            disabled={hasAllFacilityAccess}
            onClick={(e) => {
              e.preventDefault();
              const facility = facilityLookup[selectedFacility];
              onUpdateUser("organization", {
                testingFacility: [
                  ...(activeUser.organization?.testingFacility || []),
                  facility,
                ],
              });
              setSelectedFacility("");
            }}
          >
            Add
          </Button>
        </form>
      )}
    </React.Fragment>
  );
};

export default UserFacilitiesSettingsForm;
