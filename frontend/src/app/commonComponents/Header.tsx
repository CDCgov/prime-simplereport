import React, { useState } from "react";
import { Link, NavLink, useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PATIENT_TERM_PLURAL_CAP } from "../../config/constants";
import classNames from "classnames";
import { v4 as uuidv4 } from "uuid";
import Anchor from "./Anchor";
import useComponentVisible from "./ComponentVisible";
import Dropdown from "./Dropdown";
import { useSelector } from "react-redux";
import { useDispatch, connect } from "react-redux";
import { updateFacility } from "../store";

const Header = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const organization = useSelector(
    (state) => (state as any).organization as Organization
  );
  const facilities = useSelector(
    (state) => (state as any).facilities as Facility[]
  );
  const facility = useSelector((state) => (state as any).facility as Facility);
  const user = useSelector((state) => (state as any).user as User);
  const [menuVisible, setMenuVisible] = useState(false);
  const {
    ref: staffDefailsRef,
    isComponentVisible: staffDetailsVisible,
    setIsComponentVisible: setStaffDetailsVisible,
  } = useComponentVisible(false);

  const formatFullName = (user: User) => {
    // this trick will not include spaces if middlename is blank.
    let result = user.firstName;
    result += user.middleName ? ` ${user.middleName}` : "";
    result += user.lastName ? ` ${user.lastName}` : "";
    result += user.suffix ? `, ${user.suffix}` : "";
    return result;
  };

  const onFacilitySelect = (e: React.FormEvent<HTMLSelectElement>) => {
    const id = (e.target as HTMLSelectElement).value;
    dispatch(updateFacility(facilities.find((f) => f.id === id)));

    // refreshes the page with the new facility id in the url. The remaining path should be the same
    // since the header exists outside the router, we can't access the path using react router
    let currentRoute = window.location.pathname.split("/").slice(3).join("/");
    let newPath = `/facility/${id}/${currentRoute}`;
    history.push(newPath);
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
              <div className="prime-organization-name">{organization.name}</div>
            </em>
          </div>
          <button
            onClick={() => setMenuVisible(!menuVisible)}
            className="usa-menu-btn"
          >
            Menu
          </button>
        </div>

        <div className="prime-facility-select">
          <Dropdown
            selectedValue={facility.id}
            onChange={onFacilitySelect}
            options={facilities.map((f: Facility) => {
              return { label: f.name, value: f.id };
            })}
          />
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
            <li className="usa-nav__primary-item prime-staff-infobox-sidemenu prime-settings-hidden">
              <NavLink
                to={`/facility/${facility.id}/queue`}
                onClick={() => setMenuVisible(false)}
                activeClassName="active-nav-item"
                className="prime-nav-link"
                activeStyle={{
                  color: "white",
                }}
              >
                Conduct Test
              </NavLink>
            </li>
            <li className="usa-nav__primary-item prime-staff-infobox-sidemenu prime-settings-hidden">
              <NavLink
                to={`/facility/${facility.id}/results`}
                onClick={() => setMenuVisible(false)}
                activeClassName="active-nav-item"
                className="prime-nav-link"
                activeStyle={{
                  color: "white",
                }}
              >
                Results
              </NavLink>
            </li>
            <li className="usa-nav__primary-item prime-staff-infobox-sidemenu prime-settings-hidden">
              <NavLink
                to={`/facility/${facility.id}/patients`}
                onClick={() => setMenuVisible(false)}
                activeClassName="active-nav-item"
                className="prime-nav-link"
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
                  {formatFullName(user)}
                </li>
                <li className="usa-sidenav__item">{facility.name}</li>
                <li className="usa-sidenav__item">
                  <Anchor text="Log out" onClick={() => logout()} />
                </li>
              </ul>
            </li>

            <li className="usa-nav__primary-item prime-settings-hidden">
              <NavLink
                to={`/facility/${facility.id}/settings`}
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
            <li className="usa-nav__primary-item">
              <NavLink
                to={`/facility/${facility.id}/queue`}
                onClick={() => setMenuVisible(false)}
                activeClassName="active-nav-item"
                className="prime-nav-link"
                activeStyle={{
                  color: "white",
                }}
              >
                Conduct Test
              </NavLink>
            </li>
            <li className="usa-nav__primary-item">
              <NavLink
                to={`/facility/${facility.id}/results`}
                onClick={() => setMenuVisible(false)}
                activeClassName="active-nav-item"
                className="prime-nav-link"
                activeStyle={{
                  color: "white",
                }}
              >
                Results
              </NavLink>
            </li>
            <li className="usa-nav__primary-item">
              <NavLink
                to={`/facility/${facility.id}/patients`}
                onClick={() => setMenuVisible(false)}
                activeClassName="active-nav-item"
                className="prime-nav-link"
                activeStyle={{
                  color: "white",
                }}
              >
                {PATIENT_TERM_PLURAL_CAP}
              </NavLink>
            </li>
            <li className="usa-nav__primary-item">
              <NavLink
                to={`#`}
                isActive={() => staffDetailsVisible}
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
                    {formatFullName(user)}
                  </li>
                  <li className="usa-sidenav__item">{facility.name}</li>
                  <li className="usa-sidenav__item">
                    <Anchor text={" Log out"} onClick={() => logout()} />
                  </li>
                </ul>
              </div>
            </li>
            <li className="usa-nav__primary-item">
              <NavLink
                to={`/facility/${facility.id}/settings`}
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

export default connect()(Header);
