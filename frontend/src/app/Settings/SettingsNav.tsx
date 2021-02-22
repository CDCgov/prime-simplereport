import React from "react";
import { NavLink } from "react-router-dom";

const getFacilityIdFromUrl = () => {
  const queryParams = new URLSearchParams(window.location.search);
  return queryParams.has("facility") ? queryParams.get("facility") : null;
};

const SettingsNav = () => {
  return (
    <nav className="prime-secondary-nav" aria-label="Secondary navigation">
      <ul className="usa-nav__secondary-links prime-nav">
        <li className="usa-nav__secondary-item">
          <NavLink
            to={`/settings/?facility=${getFacilityIdFromUrl()}`}
            activeClassName="active"
            exact={true}
          >
            Manage Organization
          </NavLink>
        </li>
        <li className="usa-nav__secondary-item">
          <NavLink
            to={`/settings/facilities/?facility=${getFacilityIdFromUrl()}`}
            activeClassName="active"
          >
            Manage Facilities
          </NavLink>
        </li>
        {process.env.REACT_APP_USER_SETTINGS_ENABLED === "true" ? (
          <li className="usa-nav__secondary-item">
            <NavLink
              to={`/settings/users/?facility=${getFacilityIdFromUrl()}`}
              activeClassName="active"
            >
              Manage Users
            </NavLink>
          </li>
        ) : null}
      </ul>
    </nav>
  );
};

export default SettingsNav;
