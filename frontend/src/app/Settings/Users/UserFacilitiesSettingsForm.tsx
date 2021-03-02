/*
  TODO: This is a WIP
*/

import React, { useRef, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Button from '../../commonComponents/Button';

import { SettingsUser, UserFacilitySetting } from './ManageUsersContainer';
import './ManageUsers.scss';

interface Props {
  activeUser: SettingsUser; // the user you are currently attempting to edit
  allFacilities: UserFacilitySetting[]; // all facilities for the entire org; the activeUser would have a subset of these
  onUpdateUser(userId: string, key: string, value: UserFacilitySetting[]): void;
}

const UserFacilitiesSettingsForm: React.FC<Props> = ({
  activeUser,
  allFacilities,
  onUpdateUser,
}) => {
  const currentFacilities = activeUser.organization.testingFacility;
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
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });

  const onAddFacility = (
    activeUser: SettingsUser,
    selectedFacilityId: string
  ) => {
    const facilityToAdd = allFacilities.filter(
      (f) => f.id === selectedFacilityId
    )[0];
    const updatedFacilityList = currentFacilities
      ? [...currentFacilities, facilityToAdd]
      : [facilityToAdd];
    onUpdateUser(activeUser.id, 'facilities', updatedFacilityList);
  };

  const onRemoveFacility = (
    activeUser: SettingsUser,
    selectedFacilityId: string
  ) => {
    const updatedFacilityList = currentFacilities
      ? currentFacilities.filter((f) => f.id !== selectedFacilityId)
      : [];
    onUpdateUser(activeUser.id, 'facilities', updatedFacilityList);
  };

  const onAddAllFacilities = () => {
    setIsComponentVisible(false);
    onUpdateUser(activeUser.id, 'facilities', allFacilities);
  };

  const facilityAccessDescription =
    !currentFacilities || currentFacilities.length === 0
      ? 'This user currently does not have access to any facilities'
      : activeUser.roleDescription === 'admin'
      ? 'Admins have access to all facilities'
      : null;

  const userFacilities = currentFacilities
    ? currentFacilities.map((facility) => (
        <tr key={facility.id}>
          <td>{facility.name}</td>
          <td>
            {process.env.REACT_APP_EDIT_USER_FACILITIES === 'true' ? (
              <div
                className="remove-tag"
                onClick={() => onRemoveFacility(activeUser, facility.id)}
              >
                <FontAwesomeIcon icon={'trash'} className={'prime-red-icon'} />
              </div>
            ) : null}
          </td>
        </tr>
      ))
    : null;

  const addFacilityRows = allFacilities.map((facility) => (
    <tr key={facility.id}>
      <td> {facility.name} </td>
      <td>
        {!currentFacilities?.map((f) => f.id).includes(facility.id) ? (
          <Button
            variant="unstyled"
            label="Select"
            onClick={() => onAddFacility(activeUser, facility.id)}
          />
        ) : (
          'Already Assigned'
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
      <h3>Facility access</h3>
      <p>{facilityAccessDescription}</p>
      <table
        className="usa-table usa-table--borderless"
        style={{ width: '100%' }}
      >
        <tbody>{userFacilities}</tbody>
      </table>
      {process.env.REACT_APP_EDIT_USER_FACILITIES === 'true' ? (
        <Button
          variant="outline"
          type="button"
          onClick={() => {
            setIsComponentVisible(!isComponentVisible);
          }}
          label="+ Add Facility Access"
          disabled={
            currentFacilities &&
            currentFacilities.length === allFacilities.length
          }
        />
      ) : null}
      {isComponentVisible ? (
        <div className="grid-row">{allFacilityList}</div>
      ) : null}
    </React.Fragment>
  );
};

export default UserFacilitiesSettingsForm;
