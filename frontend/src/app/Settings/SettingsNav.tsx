import React from "react";
import { useLocation } from "react-router-dom";

import { LinkWithQuery } from "../commonComponents/LinkWithQuery";

const SettingsNav = () => {
  const classNameByActive = ({ isActive }: { isActive: boolean }) => {
    return isActive ? "active" : "";
  };

  const location = useLocation();
  const onFacilitiesPage =
    location.pathname.startsWith("/settings/facility") ||
    location.pathname.startsWith("/settings/add-facility");
  const classNameByActiveFacility = ({ isActive }: { isActive: boolean }) => {
    return isActive || onFacilitiesPage ? "active" : "";
  };
  const facilityActive = onFacilitiesPage ? "page" : undefined;

  return (
    <nav className="prime-secondary-nav" aria-label="Secondary navigation">
      <ul className="usa-nav__secondary-links prime-nav">
        <li className="usa-nav__secondary-item">
          <LinkWithQuery to={`/settings/1`} end className={classNameByActive}>
            Manage users
          </LinkWithQuery>
        </li>
        <li className="usa-nav__secondary-item" aria-current={facilityActive}>
          <LinkWithQuery
            to={`/settings/facilities`}
            className={classNameByActiveFacility}
          >
            Manage facilities
          </LinkWithQuery>
        </li>
        <li className="usa-nav__secondary-item">
          <LinkWithQuery
            to={`/settings/organization`}
            className={classNameByActive}
          >
            Manage organization
          </LinkWithQuery>
        </li>
        <li className="usa-nav__secondary-item">
          <LinkWithQuery
            to={`/settings/self-registration`}
            className={classNameByActive}
          >
            Patient self-registration
          </LinkWithQuery>
        </li>
      </ul>
    </nav>
  );
};

export default SettingsNav;
