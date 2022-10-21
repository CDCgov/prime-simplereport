import React from "react";

import { LinkWithQuery } from "../commonComponents/LinkWithQuery";

const PatientsNav = () => {
  const classNameByActive = ({ isActive }: { isActive: boolean }) =>
    isActive ? "active" : "";

  return (
    <nav className="prime-secondary-nav" aria-label="Secondary navigation">
      <ul className="usa-nav__secondary-links prime-nav">
        <li className="usa-nav__secondary-item">
          <LinkWithQuery to={`/add-patient`} end className={classNameByActive}>
            Add individual patient
          </LinkWithQuery>
        </li>
        <li className="usa-nav__secondary-item">
          <LinkWithQuery to={`/upload-patients`} className={classNameByActive}>
            Import from spreadsheet
          </LinkWithQuery>
        </li>
      </ul>
    </nav>
  );
};

export default PatientsNav;
