import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PATIENT_TERM_PLURAL_CAP } from "../../config/constants";
import classNames from "classnames";
import { gql, useQuery } from "@apollo/client";
import Button from "./Button";
import { getStaffColor } from "../utils";

const WHOAMI_QUERY = gql`
  {
    whoami {
      id
      firstName
      middleName
      lastName
      suffix
      organization {
        testingFacilityName
      }
    }
  }
`;

const Header = ({ organizationId }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [staffDetailsVisible, setUserDetailsVisible] = useState(false);
  const { data: whoamidata } = useQuery(WHOAMI_QUERY, {
    fetchPolicy: "no-cache",
  });
  const [staffInitials, setStaffInitials] = useState("");
  const [staffName, setStaffName] = useState("");
  const [facilityName, setFacilityName] = useState("");
  const [staffIconColor, setStaffIconColor] = useState("");
  useEffect(() => {
    if (!whoamidata || !whoamidata.whoami) return;
    const whoami = whoamidata.whoami;
    setStaffName(formatFullName(whoami));

    const ch1 = whoami.firstName ? whoami.firstName.charAt(0) : "";
    const ch2 = whoami.middleName ? whoami.middleName.charAt(0) : "";
    const ch3 = whoami.lastName ? whoami.lastName.charAt(0) : "";
    setStaffInitials(`${ch1}${ch2}${ch3}`);

    setFacilityName(whoami.organization.testingFacilityName);
    setStaffIconColor(getStaffColor(whoami.id));
  }, [staffIconColor, whoamidata]);

  const formatFullName = (whoami) => {
    // this trick will not include spaces if middlename is blank.
    let result = whoami.firstName;
    result += whoami.middleName ? ` ${whoami.middleName}` : "";
    result += whoami.lastName ? ` ${whoami.lastName}` : "";
    result += whoami.suffix ? `, ${whoami.suffix}` : "";
    return result;
  };

  const logout = () => {
    // todo: do logout here. maybe https://developer.okta.com/docs/guides/sign-users-out/react/sign-out-of-your-app/
    debugger;
    alert("OKTA logout here");
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
          <span
            className="fa-layers fa-fw fa-2x usa-nav__close prime-nav-close-button"
            onClick={() => setMenuVisible(false)}
          >
            <FontAwesomeIcon icon={"window-close"} />
          </span>

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

            <li
              className="usa-nav__primary-item prime-staff-infobox-sidemenu prime-settings-hidden"
              style={{
                backgroundColor: staffIconColor,
                color: "white",
              }}
            >
              <FontAwesomeIcon
                icon={"user"}
                size="2x"
                style={{
                  fill: "white",
                }}
              />
              <span className={"prime-username-icon-span"}>
                {staffInitials}
              </span>
            </li>

            <li className="usa-nav__primary-item usa-sidenav prime-staff-infobox-sidemenu prime-settings-hidden">
              <ul className="usa-sidenav__sublist prime-sidenav_inset">
                <li className="usa-sidenav__item span-full-name">
                  {staffName}
                </li>
                <li className="usa-sidenav__item">{facilityName}</li>
                <li className="usa-sidenav__item">
                  <Button
                    label=" Switch users"
                    secondaryInverse
                    big
                    icon="sign-out-alt"
                    onClick={() => logout()}
                  />
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

        <nav aria-label="Primary navigation" className="usa-nav prime-nav">
          <ul className="usa-nav__primary usa-accordion">
            <li
              className="usa-nav__primary-item"
              style={{
                backgroundColor: staffIconColor,
                color: "white",
              }}
            >
              <NavLink
                to={`#`}
                isActive={() => false}
                onClick={(e) => {
                  e.preventDefault();
                  setUserDetailsVisible(!staffDetailsVisible);
                }}
                activeClassName="active-nav-item"
                style={{
                  backgroundColor: staffIconColor,
                  color: "white",
                }}
              >
                <FontAwesomeIcon
                  icon={"user"}
                  size="2x"
                  style={{
                    fill: "white",
                  }}
                />
                <span className={"prime-username-icon-span"}>
                  {staffInitials}
                </span>
              </NavLink>
              <div
                aria-label="Primary navigation"
                className={classNames("usa-nav", "prime-staff-infobox", {
                  "is-prime-staff-infobox-visible": staffDetailsVisible,
                })}
              >
                <ul className="usa-sidenav__sublist prime-sidenav_inset">
                  <li className="usa-sidenav__item span-full-name">
                    {staffName}
                  </li>
                  <li className="usa-sidenav__item">{facilityName}</li>
                  <li className="usa-sidenav__item">
                    <Button
                      label={" Switch users"}
                      secondaryInverse
                      big
                      icon="sign-out-alt"
                      onClick={() => logout()}
                    />
                  </li>
                </ul>
                <span
                  className="fa-layers fa-fw fa-2x prime-close-button-popup"
                  onClick={() => setUserDetailsVisible(false)}
                >
                  <FontAwesomeIcon icon={"window-close"} />
                </span>
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
