import React from 'react';

import Button from '../commonComponents/Button';
import { formatFullName } from '../utils/user';

import './FacilitySelect.scss';

interface Props {
  setActiveFacility: (facility: Facility) => void;
  facilities: Facility[];
  organization: Organization;
  user: User;
}

const FacilitySelect: React.FC<Props> = ({
  facilities,
  organization,
  user,
  setActiveFacility,
}) => {
  return (
    <main className="prime-home" id="facility-select">
      <div className="grid-container">
        <div className="grid-row position-relative">
          <div className="prime-container usa-card__container">
            <div className="usa-card__header">
              <div>
                <h2>SimpleReport</h2>
                <div className="organization-name">{organization.name}</div>
              </div>
            </div>
            <div className="usa-card__body">
              <p className="welcome">Welcome, {formatFullName(user)}</p>
              <p className="select-text">
                Please select which facility you are working at today
              </p>
              {facilities.map((f) => (
                <Button
                  key={f.id}
                  onClick={() => setActiveFacility(f)}
                  variant="outline"
                >
                  {f.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default FacilitySelect;
