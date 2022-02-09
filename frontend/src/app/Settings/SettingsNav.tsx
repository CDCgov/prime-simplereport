import React from "react";

import { LinkWithQuery } from "../commonComponents/LinkWithQuery";

const SettingsNav = () => {
  const classNameByActive = ({ isActive }: { isActive: boolean }) =>
    isActive ? "active" : "";

  return (
    <nav className="prime-secondary-nav" aria-label="Secondary navigation">
      <ul className="usa-nav__secondary-links prime-nav">
        <li className="usa-nav__secondary-item">
          <LinkWithQuery to={`/settings`} end className={classNameByActive}>
            Manage users
          </LinkWithQuery>
        </li>
        <li className="usa-nav__secondary-item">
          <LinkWithQuery
            to={`/settings/facilities`}
            className={classNameByActive}
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
