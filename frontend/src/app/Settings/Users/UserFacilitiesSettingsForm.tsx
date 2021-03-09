import React, { useRef, useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinusCircle } from "@fortawesome/free-solid-svg-icons";
import classnames from "classnames";

import Checkboxes from "../../commonComponents/Checkboxes";
import Dropdown from "../../commonComponents/Dropdown";
import Button from "../../commonComponents/Button";

import { UpdateUser } from "./ManageUsers";
import { SettingsUser, UserFacilitySetting } from "./ManageUsersContainer";

import "./ManageUsers.scss";

type MinimalFacilityInfo = Pick<Facility, "id" | "name">;
type FacilityLookup = Record<string, MinimalFacilityInfo>;

const getHasAllFacilityAccess = (user: SettingsUser) =>
  user.roles.some((role) => role === "ADMIN" || role === "ALL_FACILITIES");

const alphabeticalFacilitySort = (
  a: MinimalFacilityInfo,
  b: MinimalFacilityInfo
) => {
  if (a.name === b.name) {
    return 0;
  }
  return a.name > b.name ? 1 : -1;
};

interface Props {
  activeUser: SettingsUser; // the user you are currently attempting to edit
  allFacilities: UserFacilitySetting[]; // all facilities for the entire org; the activeUser would have a subset of these
  onUpdateUser: UpdateUser;
}

const UserFacilitiesSettingsForm: React.FC<Props> = ({
  activeUser,
  allFacilities,
  onUpdateUser,
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
    activeUser: SettingsUser,
    selectedFacilityId: string
  ) => {
    onUpdateUser(
      activeUser.id,
      "facilities",
      activeUser.facilities.filter((f) => f.id !== selectedFacilityId)
    );
  };

  const isAdmin = activeUser.roles.includes("ADMIN");

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
      activeUser.facilities.length !== allFacilities.length
    ) {
      onUpdateUser(
        activeUser.id,
        "facilities",
        allFacilities.map(({ id, name }) => ({ id, name }))
      );
    }
  }, [hasAllFacilityAccess, activeUser, onUpdateUser, allFacilities]);

  const userFacilities = hasAllFacilityAccess
    ? [...allFacilities].sort(alphabeticalFacilitySort)
    : [...activeUser.facilities].sort(alphabeticalFacilitySort);

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
      <h3>Facility access</h3>
      <p>{facilityAccessDescription}</p>
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
            onUpdateUser(activeUser.id, "roles", [
              ...activeUser.roles,
              "ALL_FACILITIES",
            ]);
          } else {
            onUpdateUser(
              activeUser.id,
              "roles",
              activeUser.roles.filter((role) => role !== "ALL_FACILITIES")
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
            <td colSpan={2}>Please add at least one facility</td>
          )}
          {userFacilities.map((facility) => (
            <tr key={facility.id}>
              <td>{facility.name}</td>
              <td>
                <button
                  className={removeButtonClasses}
                  onClick={() => onRemoveFacility(activeUser, facility.id)}
                  disabled={hasAllFacilityAccess}
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
          <Dropdown
            className="width-card-lg"
            options={[
              { value: "all", label: "All Facilities" },
              ...facilitiesToAdd.map(({ name, id }) => ({
                label: name,
                value: id,
              })),
            ]}
            onChange={(e) => {
              setSelectedFacility(e.target.value);
            }}
            selectedValue={selectedFacility}
            defaultValue=""
            defaultSelect
            disabled={hasAllFacilityAccess}
          />
          <Button
            className="height-5 margin-left-2"
            variant="outline"
            disabled={hasAllFacilityAccess}
            onClick={(e) => {
              e.preventDefault();
              if (selectedFacility === "all") {
                onUpdateUser(
                  activeUser.id,
                  "facilities",
                  allFacilities.map(({ id, name }) => ({ id, name }))
                );
              } else {
                const facility = facilityLookup[selectedFacility];
                onUpdateUser(activeUser.id, "facilities", [
                  ...activeUser.facilities,
                  facility,
                ]);
              }
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
