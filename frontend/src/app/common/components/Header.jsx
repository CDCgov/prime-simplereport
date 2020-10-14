import React from "react";
import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";

const Header = ({ organizationId }) => {
  return (
    <header className="usa-header usa-header--basic">
      <div className="usa-nav-container">
        <div className="usa-nav-bar">
          <div className="usa-logo" id="basic-logo">
            <em className="usa-logo__text">
              <Link to="/">PRIME Data Input</Link>
            </em>
          </div>
          <nav aria-label="Primary navigation" className="usa-nav">
            <ul className="usa-nav__primary usa-accordion">
              <li className="usa-nav__primary-item">
                <NavLink
                  to={`/organization/${organizationId}/queue`}
                  activeClassName="prime-nav"
                >
                  Test Queue
                </NavLink>
              </li>
              <li className="usa-nav__primary-item">
                <NavLink
                  to={`/organization/${organizationId}/results`}
                  activeClassName="prime-nav"
                >
                  Results
                </NavLink>
              </li>
              <li className="usa-nav__primary-item">
                <NavLink to="/patients" activeClassName="prime-nav">
                  Mange Patients
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};
Header.propTypes = {
  organizationId: PropTypes.string,
};

export default Header;
