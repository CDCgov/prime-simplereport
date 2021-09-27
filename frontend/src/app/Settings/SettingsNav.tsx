import React from "react";

import { LinkWithQuery } from "../commonComponents/LinkWithQuery";

const SettingsNav = () => {
  return (
    <nav className="prime-secondary-nav" aria-label="Secondary navigation">
      <ul className="usa-nav__secondary-links prime-nav">
        <li className="usa-nav__secondary-item">
          <LinkWithQuery to={`/settings`} activeClassName="active" exact={true}>
            Testing data
          </LinkWithQuery>
        </li>
        <li className="usa-nav__secondary-item">
          <LinkWithQuery to={`/settings/manage-users`} activeClassName="active">
            Manage users
          </LinkWithQuery>
        </li>
        <li className="usa-nav__secondary-item">
          <LinkWithQuery to={`/settings/facilities`} activeClassName="active">
            Manage facilities
          </LinkWithQuery>
        </li>
        <li className="usa-nav__secondary-item">
          <LinkWithQuery to={`/settings/organization`} activeClassName="active">
            Manage organization
          </LinkWithQuery>
        </li>
        <li className="usa-nav__secondary-item">
          <LinkWithQuery
            to={`/settings/self-registration`}
            activeClassName="active"
          >
            Patient self-registration
          </LinkWithQuery>
        </li>
      </ul>
    </nav>
  );
};

export default SettingsNav;
