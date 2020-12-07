import React from "react";
import { NavLink } from "react-router-dom";

const SettingsNav = () => {
  return (
    <nav className="prime-secondary-nav" aria-label="Secondary navigation">
      <ul className="usa-nav__secondary-links prime-nav">
        <li className="usa-nav__secondary-item">
          <NavLink
            to={`/settings`}
            onClick={() => 4}
            activeClassName="active"
            exact={true}
          >
            Manage Organization
          </NavLink>
        </li>{" "}
        <li className="usa-nav__secondary-item">
          <NavLink
            to={`/settings/facilities`}
            onClick={() => 4}
            activeClassName="active"
          >
            Manage facilities
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default SettingsNav;
