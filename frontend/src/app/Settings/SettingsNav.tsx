import React from "react";

import { LinkWithQuery } from "../commonComponents/LinkWithQuery";
import { NewFeatureTag } from "../commonComponents/NewFeatureTag";

const SettingsNav = () => {
  return (
    <nav className="prime-secondary-nav" aria-label="Secondary navigation">
      <ul className="usa-nav__secondary-links prime-nav">
        {process.env.REACT_APP_USER_SETTINGS_ENABLED === "true" ? (
          <li className="usa-nav__secondary-item">
            <LinkWithQuery
              to={`/settings`}
              activeClassName="active"
              exact={true}
            >
              Manage Users
            </LinkWithQuery>
          </li>
        ) : null}
        <li className="usa-nav__secondary-item">
          <LinkWithQuery to={`/settings/facilities`} activeClassName="active">
            Manage Facilities
          </LinkWithQuery>
        </li>
        <li className="usa-nav__secondary-item">
          <LinkWithQuery to={`/settings/organization`} activeClassName="active">
            Manage Organization
          </LinkWithQuery>
        </li>
        <li className="usa-nav__secondary-item">
          <LinkWithQuery
            to={`/settings/self-registration`}
            activeClassName="active"
          >
            Patient self-registration{" "}
            <NewFeatureTag feature="selfRegistration" />
          </LinkWithQuery>
        </li>
      </ul>
    </nav>
  );
};

export default SettingsNav;
