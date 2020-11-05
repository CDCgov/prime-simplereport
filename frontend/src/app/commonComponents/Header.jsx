import React from "react";
import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PATIENT_TERM_CAP } from "../../config/constants";

const Header = ({ organizationId }) => {
  return (
    <header className="usa-header usa-header--basic">
      <div className="usa-nav-container">
        <div className="usa-navbar">
          <div className="usa-logo" id="basic-logo">
            <em className="usa-logo__text">
              <Link to="/">PRIME Data Input</Link>
            </em>
          </div>
        </div>
        <nav aria-label="Primary navigation" className="usa-nav prime-nav">
          <ul className="usa-nav__primary usa-accordion">
            <li className="usa-nav__primary-item">
              <NavLink
                to={`/organization/${organizationId}/queue`}
                activeClassName="active-nav-item"
                activeStyle={{
                  color: "white",
                }}
              >
                Test Queue
              </NavLink>
            </li>
            <li className="usa-nav__primary-item">
              <NavLink
                to={`/organization/${organizationId}/results`}
                activeClassName="active-nav-item"
                activeStyle={{
                  color: "white",
                }}
              >
                Results
              </NavLink>
            </li>
            <li className="usa-nav__primary-item">
              <NavLink
                to={`/organization/${organizationId}/patients`}
                activeClassName="active-nav-item"
                activeStyle={{
                  color: "white",
                }}
              >
                Manage {PATIENT_TERM_CAP}
              </NavLink>
            </li>
          </ul>
        </nav>
        <nav aria-label="Primary navigation" className="usa-nav prime-nav">
          <ul className="usa-nav__primary usa-accordion">
            <li className="usa-nav__primary-item">
              <NavLink
                to={`/organization/${organizationId}/settings`}
                activeClassName="active-nav-item"
                activeStyle={{
                  color: "white",
                }}
              >
                <FontAwesomeIcon icon={"cog"} size="2x" />
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};
Header.propTypes = {
  organizationId: PropTypes.string,
};

export default Header;
