import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PATIENT_TERM_PLURAL_CAP } from "../../config/constants";
import classNames from "classnames";
import { gql, useQuery } from "@apollo/client";
import { v4 as uuidv4 } from "uuid";
import Anchor from "./Anchor";
import useComponentVisible from "./ComponentVisible";

const WHOAMI_QUERY = gql`
  {
    whoami {
      id
      firstName
      middleName
      lastName
      suffix
      organization {
        testingFacility {
          name
        }
      }
    }
  }
`;

const Header = ({ organizationId }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const {
    ref: staffDefailsRef,
    isComponentVisible: staffDetailsVisible,
    setIsComponentVisible: setStaffDetailsVisible,
  } = useComponentVisible(false);
  const { data: whoamidata } = useQuery(WHOAMI_QUERY, {
    fetchPolicy: "no-cache",
  });
  const [staffName, setStaffName] = useState("");
  const [facilityName, setFacilityName] = useState("");
  useEffect(() => {
    if (!whoamidata || !whoamidata.whoami) return;
    const whoami = whoamidata.whoami;
    setStaffName(formatFullName(whoami));
    setFacilityName(whoami.organization.testingFacility.name);
  }, [whoamidata]);

  const formatFullName = (whoami) => {
    // this trick will not include spaces if middlename is blank.
    let result = whoami.firstName;
    result += whoami.middleName ? ` ${whoami.middleName}` : "";
    result += whoami.lastName ? ` ${whoami.lastName}` : "";
    result += whoami.suffix ? `, ${whoami.suffix}` : "";
    return result;
  };

  const logout = () => {
    // Fetch the id_token from local storage
    const id_token = localStorage.getItem("id_token");
    const state = uuidv4();
    // Remove auth data from local_storage
    localStorage.removeItem("access_token");
    localStorage.removeItem("id_token");
    window.location.replace(
      `https://hhs-prime.okta.com/oauth2/default/v1/logout?id_token_hint=${id_token}&post_logout_redirect_uri=https://simplereport.cdc.gov&state=${state}`
    );
  };
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
            className="fa-layers fa-fw fa-2x usa-nav__close prime-nav-close-button"
            onClick={() => setMenuVisible(false)}
            title={"close menu"}
          >
            <FontAwesomeIcon icon={"window-close"} />
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

            <li className="usa-nav__primary-item prime-staff-infobox-sidemenu prime-settings-hidden">
              <FontAwesomeIcon
                icon={"user"}
                size="2x"
                style={{
                  fill: "white",
                }}
              />
            </li>

            <li className="usa-nav__primary-item usa-sidenav prime-staff-infobox-sidemenu prime-settings-hidden">
              <ul className="usa-sidenav__sublist prime-sidenav_inset">
                <li className="usa-sidenav__item span-full-name">
                  {staffName}
                </li>
                <li className="usa-sidenav__item">{facilityName}</li>
                <li className="usa-sidenav__item">
                  <Anchor text="Log out" onClick={() => logout()} />
                </li>
              </ul>
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
                <FontAwesomeIcon icon={"cog"} size="2x" /> Settings
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* This is the side nav menu section */}
        <nav aria-label="Primary navigation" className="usa-nav prime-nav">
          <ul className="usa-nav__primary usa-accordion">
            <li
              className={classNames("usa-nav__primary-item", {
                "active-nav-item": staffDetailsVisible,
              })}
            >
              <NavLink
                to={`#`}
                isActive={() => false}
                onClick={(e) => {
                  e.preventDefault();
                  setStaffDetailsVisible(!staffDetailsVisible);
                }}
                activeClassName="active-nav-item"
              >
                <FontAwesomeIcon
                  icon={"user"}
                  size="2x"
                  style={{
                    color: staffDetailsVisible ? "white" : "",
                  }}
                />
              </NavLink>
              <div
                ref={staffDefailsRef}
                aria-label="Primary navigation"
                className={classNames("shadow-3", "prime-staff-infobox", {
                  "is-prime-staff-infobox-visible": staffDetailsVisible,
                })}
              >
                <ul className="usa-sidenav__sublist">
                  <li className="usa-sidenav__item span-full-name">
                    {staffName}
                  </li>
                  <li className="usa-sidenav__item">{facilityName}</li>
                  <li className="usa-sidenav__item">
                    <Anchor
                      className="prime-force-link-in-nav"
                      text={" Log out"}
                      onClick={() => logout()}
                    />
                  </li>
                </ul>
              </div>
            </li>
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
