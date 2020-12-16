import React from "react";
import { NavLink, useRouteMatch } from "react-router-dom";

const SettingsNav = () => {
  let match = useRouteMatch();
  let basePath = match.path.split("/").slice(0, 3).join("/");
  return (
    <nav className="prime-secondary-nav" aria-label="Secondary navigation">
      <ul className="usa-nav__secondary-links prime-nav">
        <li className="usa-nav__secondary-item">
          <NavLink
            to={`${basePath}/settings`}
            onClick={() => 4}
            activeClassName="active"
            exact={true}
          >
            Manage Organization
          </NavLink>
        </li>{" "}
        <li className="usa-nav__secondary-item">
          <NavLink
            to={`${basePath}/settings/facilities`}
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
