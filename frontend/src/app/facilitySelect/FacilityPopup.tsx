import React from "react";
import { useSelector } from "react-redux";

import { formatFullName } from "../utils/user";
import siteLogo from "../../img/simplereport-logo-color.svg";

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
        <div className="prime-container card-container">
          <div className="usa-card__body">
            <div className="text-center">
              <img
                className="flex-align-self-center maxw-card-lg width-full"
                src={siteLogo}
                alt="SimpleReport logo"
              />
              <h1 className="text-primary-darker text-bold">
                {organization.name}
              </h1>
              <p className="text-bold text-center margin-7">
                Welcome, {formatFullName(user)}
              </p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </main>
  );
};

export default FacilityPopup;
