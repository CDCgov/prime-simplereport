import React, { useRef, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Button from "../../commonComponents/Button";
import { SettingsUser, UserFacilitySetting } from "./ManageUsersContainer";
import "./ManageUsers.scss";

interface Props {
  activeUser: SettingsUser; // the user you are currently attempting to edit
  allFacilities: UserFacilitySetting[];
  onUpdateUser(userId: string, key: string, value: UserFacilitySetting[]): void;
}

const UserFacilitiesSettingsForm: React.FC<Props> = ({
  activeUser,
  allFacilities,
  onUpdateUser,
}) => {
  const [isComponentVisible, setIsComponentVisible] = useState(false);
  const ref = useRef() as React.MutableRefObject<HTMLDivElement>;

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

  const onAddFacility = (
    activeUser: SettingsUser,
    selectedFacilityId: string
  ) => {
    const facilityToAdd = allFacilities.filter(
      (f) => f.id === selectedFacilityId
    )[0];
    const updatedFacilityList = activeUser.facilities
      ? [...activeUser.facilities, facilityToAdd]
      : [facilityToAdd];
    onUpdateUser(activeUser.id, "facilities", updatedFacilityList);
  };

  const onRemoveFacility = (
    activeUser: SettingsUser,
    selectedFacilityId: string
  ) => {
    const updatedFacilityList = activeUser.facilities
      ? activeUser.facilities.filter((f) => f.id !== selectedFacilityId)
      : [];
    onUpdateUser(activeUser.id, "facilities", updatedFacilityList);
  };

  const onAddAllFacilities = () => {
    setIsComponentVisible(false);
    onUpdateUser(activeUser.id, "facilities", allFacilities);
  };

  const facilityAccessDescription =
    !activeUser.facilities || activeUser.facilities.length === 0
      ? "This user currently does not have access to any facilities"
      : activeUser.role === "admin"
      ? "Admins have access to all facilities"
      : null;

  const userFacilities = activeUser.facilities
    ? activeUser.facilities.map((facility) => (
        <tr key={facility.id}>
          <td>{facility.name}</td>
          <td>
            <div
              className="remove-tag"
              onClick={() => onRemoveFacility(activeUser, facility.id)}
            >
              <FontAwesomeIcon icon={"trash"} className={"prime-red-icon"} />
            </div>
          </td>
        </tr>
      ))
    : null;

  const addFacilityRows = allFacilities.map((facility) => (
    <tr key={facility.id}>
      <td> {facility.name} </td>
      <td>
        {!activeUser.facilities?.map((f) => f.id).includes(facility.id) ? (
          <Button
            variant="unstyled"
            label="Select"
            onClick={() => onAddFacility(activeUser, facility.id)}
          />
        ) : (
          "Already Assigned"
        )}
      </td>
    </tr>
  ));

  const allFacilityList = (
    <div
      ref={ref}
      className="usa-card__container shadow-2 display-inline-block margin-0"
    >
      <div className="usa-card__body">
        <table className="usa-table usa-table--borderless facility-list">
          <thead>
            <tr>
              <th scope="col"></th>
              <th scope="col">
                <Button
                  variant="unstyled"
                  label="Select All"
                  onClick={onAddAllFacilities}
                />
              </th>
            </tr>
          </thead>
          <tbody>{addFacilityRows}</tbody>
        </table>
      </div>
    </div>
  );
  return (
    <React.Fragment>
      <h3> Facility Access </h3>
      <p>{facilityAccessDescription}</p>
      <table
        className="usa-table usa-table--borderless"
        style={{ width: "100%" }}
      >
        <tbody>{userFacilities}</tbody>
      </table>
      <Button
        variant="outline"
        type="button"
        onClick={() => {
          setIsComponentVisible(!isComponentVisible);
        }}
        label="+ Add Facility"
        disabled={
          activeUser.facilities &&
          activeUser.facilities.length === allFacilities.length
        }
      />
      {isComponentVisible ? (
        <div className="grid-row">{allFacilityList}</div>
      ) : null}
    </React.Fragment>
  );
};

export default UserFacilitiesSettingsForm;
