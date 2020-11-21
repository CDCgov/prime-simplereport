import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PATIENT_TERM_PLURAL_CAP } from "../../config/constants";
import classNames from "classnames";
import iconClose from "../../img/close-gray-60.svg";

const Header = ({ organizationId }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  return (
    <header className="usa-header usa-header--basic">
      <div className="usa-nav-container">
        <div className="usa-navbar">
          <div className="usa-logo" id="basic-logo">
            <em className="usa-logo__text">
              <Link to="/">{process.env.REACT_APP_TITLE}</Link>
            </em>
          </div>
          <button
            onClick={() => setMenuVisible(!menuVisible)}
            className="usa-menu-btn"
          >
            Menu
          </button>
        </div>
        <nav
          aria-label="Primary navigation"
          className={classNames("usa-nav", "prime-nav", {
            "is-visible": menuVisible,
          })}
        >
          <button
            className="usa-nav__close prime-nav-close-button"
            onClick={() => setMenuVisible(false)}
          >
            <img src={iconClose} role="img" alt="close menu" />
          </button>
          <ul className="usa-nav__primary usa-accordion">
            <li className="usa-nav__primary-item">
              <NavLink
                to={`/organization/${organizationId}/queue`}
                onClick={() => setMenuVisible(false)}
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
                onClick={() => setMenuVisible(false)}
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
                onClick={() => setMenuVisible(false)}
                activeClassName="active-nav-item"
                activeStyle={{
                  color: "white",
                }}
              >
                {PATIENT_TERM_PLURAL_CAP}
              </NavLink>
            </li>

            <li className="usa-nav__primary-item prime-settings-hidden">
              <NavLink
                to={`/organization/${organizationId}/settings`}
                onClick={() => setMenuVisible(false)}
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

        <nav aria-label="Primary navigation" className="usa-nav prime-nav">
          <ul className="usa-nav__primary usa-accordion">
            <li className="usa-nav__primary-item">
              <NavLink
                to={`/organization/${organizationId}/settings`}
                onClick={() => setMenuVisible(false)}
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
