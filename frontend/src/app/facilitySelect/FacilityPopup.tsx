import React from "react";
import { useSelector } from "react-redux";

import { formatFullName } from "../utils/user";

import "./FacilitySelect.scss";

type FacilityPopupProps = {
  children: React.ReactNode;
};

const FacilityPopup: React.FC<FacilityPopupProps> = ({ children }) => {
  const organization = useSelector(
    (state) => (state as any).organization as Organization
  );
  const user = useSelector((state) => (state as any).user as User);

  return (
    <main className="prime-home" id="facility-select">
      <div className="grid-container">
        <div className="grid-row position-relative">
          <div className="prime-container card-container">
            <div className="usa-card__header">
              <div>
                <h2>SimpleReport</h2>
                <div className="organization-name">{organization.name}</div>
              </div>
            </div>
            <div className="usa-card__body">
              <p className="welcome">Welcome, {formatFullName(user)}</p>
              {children}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default FacilityPopup;
