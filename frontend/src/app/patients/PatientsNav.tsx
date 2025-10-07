import React from "react";

import { LinkWithQuery } from "../commonComponents/LinkWithQuery";
import { PATIENT_TERM } from "../../config/constants";

function classNameByActive({ isActive }: { isActive: boolean }) {
  return isActive ? "active" : "";
}

const PatientsNav = () => {
  return (
    <nav
      className="prime-secondary-nav padding-top-2"
      aria-label="Secondary navigation"
    >
      <ul className="usa-nav__secondary-links prime-nav">
        <li className="usa-nav__secondary-item padding-left-0">
          <LinkWithQuery to={`/add-patient`} end className={classNameByActive}>
            Add individual {PATIENT_TERM}
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
