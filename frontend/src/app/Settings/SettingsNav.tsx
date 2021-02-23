import React from "react";
import { NavLink } from "react-router-dom";
import { LinkWithQuery } from "../commonComponents/LinkWithQuery";

const getFacilityIdFromUrl = () => {
  const queryParams = new URLSearchParams(window.location.search);
  return queryParams.has("facility") ? queryParams.get("facility") : null;
};

const SettingsNav = () => {
  return (
    <nav className="prime-secondary-nav" aria-label="Secondary navigation">
      <ul className="usa-nav__secondary-links prime-nav">
        <li className="usa-nav__secondary-item">
          <LinkWithQuery to={`/settings`} activeClassName="active" exact={true}>
            Manage Organization
          </LinkWithQuery>
        </li>
        <li className="usa-nav__secondary-item">
          <LinkWithQuery to={`/settings/facilities`} activeClassName="active">
            Manage Facilities
          </LinkWithQuery>
        </li>
        {process.env.REACT_APP_USER_SETTINGS_ENABLED === "true" ? (
          <li className="usa-nav__secondary-item">
            <LinkWithQuery to={`/settings/users`} activeClassName="active">
              Manage users
            </LinkWithQuery>
          </li>
        ) : null}
      </ul>
    </nav>
  );
};

export default SettingsNav;
