import React from "react";

import { LinkWithQuery } from "../commonComponents/LinkWithQuery";

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
              Manage Users
            </LinkWithQuery>
          </li>
        ) : null}
      </ul>
    </nav>
  );
};

export default SettingsNav;
