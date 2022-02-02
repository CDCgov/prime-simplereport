import React from "react";

import { LinkWithQuery } from "../commonComponents/LinkWithQuery";

const SettingsNav = () => {
  return (
    <nav className="prime-secondary-nav" aria-label="Secondary navigation">
      <ul className="usa-nav__secondary-links prime-nav">
        <li className="usa-nav__secondary-item">
          <LinkWithQuery
            to={`/settings`}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Manage users
          </LinkWithQuery>
        </li>
        <li className="usa-nav__secondary-item">
          <LinkWithQuery
            to={`/settings/facilities`}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Manage facilities
          </LinkWithQuery>
        </li>
        <li className="usa-nav__secondary-item">
          <LinkWithQuery
            to={`/settings/organization`}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Manage organization
          </LinkWithQuery>
        </li>
        <li className="usa-nav__secondary-item">
          <LinkWithQuery
            to={`/settings/self-registration`}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Patient self-registration
          </LinkWithQuery>
        </li>
      </ul>
    </nav>
  );
};

export default SettingsNav;
