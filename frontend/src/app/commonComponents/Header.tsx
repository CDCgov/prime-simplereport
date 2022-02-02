import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { v4 as uuidv4 } from "uuid";
import { useSelector, connect } from "react-redux";

import { PATIENT_TERM_PLURAL_CAP } from "../../config/constants";
import { formatFullName, formatRole } from "../utils/user";
import siteLogo from "../../img/simplereport-logo-color.svg";
import { hasPermission, appPermissions } from "../permissions";
import { RootState } from "../store";
import { useSelectedFacility } from "../facilitySelect/useSelectedFacility";
import { getAppInsights } from "../TelemetryService";

import Button from "./Button/Button";
import Dropdown from "./Dropdown";
import useComponentVisible from "./ComponentVisible";
import { LinkWithQuery } from "./LinkWithQuery";
import ChangeUser from "./ChangeUser";

import "./Header.scss";

const Header: React.FC<{}> = () => {
  const appInsights = getAppInsights();

  const handleSupportClick = () => {
    if (appInsights) {
      appInsights.trackEvent({ name: "Support" });
    }
  };

  const isSupportAdmin = useSelector<RootState, boolean>(
    (state) => state.user.isAdmin
  );
  const organization = useSelector(
    (state) => (state as any).organization as Organization
  );
  const facilities = useSelector(
    (state) => ((state as any).facilities as Facility[]) || []
  );
  const [selectedFacility, setSelectedFacility] = useSelectedFacility();
  const facility = selectedFacility || { id: "", name: "" };

  const user = useSelector((state) => (state as any).user as User);
  const [menuVisible, setMenuVisible] = useState(false);
  const {
    ref: staffDefailsRef,
    isComponentVisible: staffDetailsVisible,
    setIsComponentVisible: setStaffDetailsVisible,
  } = useComponentVisible(false);

  const onFacilitySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = facilities.find((f) => f.id === e.target.value);
    if (selected) {
      setSelectedFacility(selected);
    }
  };

  const canViewSettings = hasPermission(
    user.permissions,
    appPermissions.settings.canView
  );

  const canViewPeople = hasPermission(
    user.permissions,
    appPermissions.people.canView
  );

  const canViewResults = hasPermission(
    user.permissions,
    appPermissions.results.canView
  );

  const canViewTestQueue = hasPermission(
    user.permissions,
    appPermissions.tests.canView
  );

  let siteLogoLinkPath: string;

  if (isSupportAdmin) {
    siteLogoLinkPath = "/admin";
  } else if (canViewSettings) {
    siteLogoLinkPath = "/dashboard";
  } else {
    siteLogoLinkPath = "/queue";
  }

  const logout = () => {
    // Fetch the id_token from local storage
    const id_token = localStorage.getItem("id_token");
    const state = uuidv4();
    // Remove auth data from local_storage
    localStorage.removeItem("access_token");
    localStorage.removeItem("id_token");
    // Determine which Okta domain to use for logout
    const oktaDomain =
      process.env.NODE_ENV !== "development" ? "okta" : "oktapreview";
    window.location.replace(
      "https://hhs-prime." +
        encodeURIComponent(oktaDomain) +
        ".com/oauth2/default/v1/logout" +
        `?id_token_hint=${encodeURIComponent(id_token || "")}` +
        `&post_logout_redirect_uri=${encodeURIComponent(
          process.env.REACT_APP_BASE_URL || ""
        )}` +
        `&state=${state}`
    );
  };

  const activeNavItem = "active-nav-item prime-nav-link";
  const inactiveNavItem = "prime-nav-link";
  const getNavItemClassName = ({ isActive }: { isActive: boolean }) =>
    isActive ? activeNavItem : inactiveNavItem;

  return (
    <header className="usa-header usa-header--basic">
      <div className="usa-nav-container prime-header">
        <div className="usa-navbar">
          <div className="usa-logo" id="basic-logo">
            <LinkWithQuery to={siteLogoLinkPath} title="Home" aria-label="Home">
              <img
                className="width-card desktop:width-full"
                src={siteLogo}
                alt="{process.env.REACT_APP_TITLE}"
              />
            </LinkWithQuery>
            <div className="prime-organization-name">{organization.name}</div>
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
          className={classNames(
            "usa-nav",
            "prime-nav",
            "desktop:display-none",
            {
              "is-visible": menuVisible,
            }
          )}
        >
          <button
            className="fa-layers fa-fw fa-2x usa-nav__close prime-nav-close-button"
            onClick={() => setMenuVisible(false)}
            title={"close menu"}
          >
            <FontAwesomeIcon icon={"window-close"} />
          </button>

          <ul className="usa-nav__primary usa-accordion">
            {canViewSettings ? (
              <li className="usa-nav__primary-item prime-staff-infobox-sidemenu prime-settings-hidden">
                <LinkWithQuery
                  to={`/dashboard`}
                  onClick={() => setMenuVisible(false)}
                  className={getNavItemClassName}
                >
                  Dashboard
                </LinkWithQuery>
              </li>
            ) : null}
            {canViewTestQueue ? (
              <li className="usa-nav__primary-item prime-staff-infobox-sidemenu prime-settings-hidden">
                <LinkWithQuery
                  to={`/queue`}
                  onClick={() => setMenuVisible(false)}
                  className={getNavItemClassName}
                >
                  Conduct tests
                </LinkWithQuery>
              </li>
            ) : null}
            {canViewResults ? (
              <li className="usa-nav__primary-item prime-staff-infobox-sidemenu prime-settings-hidden">
                <LinkWithQuery
                  to={`/results`}
                  onClick={() => setMenuVisible(false)}
                  className={getNavItemClassName}
                >
                  Results
                </LinkWithQuery>
              </li>
            ) : null}
            {canViewPeople ? (
              <li className="usa-nav__primary-item prime-staff-infobox-sidemenu prime-settings-hidden">
                <LinkWithQuery
                  to={`/patients`}
                  onClick={() => setMenuVisible(false)}
                  className={getNavItemClassName}
                >
                  {PATIENT_TERM_PLURAL_CAP}
                </LinkWithQuery>
              </li>
            ) : null}
            <li className="usa-nav__primary-item prime-staff-infobox-sidemenu prime-settings-hidden">
              <FontAwesomeIcon
                icon={"user-circle"}
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
                <li className="usa-sidenav__item">
                  <span>
                    <strong>Role: </strong>
                    {formatRole(user.roleDescription)}
                  </span>
                </li>
                <li className="usa-sidenav__item">{facility.name}</li>
              </ul>
            </li>
            <div>
              <div className="navlink__support">
                <a
                  href="https://www.simplereport.gov/support"
                  target="none"
                  onClick={() => handleSupportClick()}
                >
                  Support
                </a>
              </div>
              <Button variant="unstyled" label="Log out" onClick={logout} />
              <ChangeUser />
            </div>
            {canViewSettings ? (
              <li className="usa-nav__primary-item prime-settings-hidden">
                <LinkWithQuery
                  to={`/settings`}
                  onClick={() => setMenuVisible(false)}
                  className={({ isActive }) =>
                    isActive ? "active-nav-item" : ""
                  }
                  style={({ isActive }) => ({ color: isActive ? "white" : "" })}
                >
                  <FontAwesomeIcon icon={"cog"} /> Settings
                </LinkWithQuery>
              </li>
            ) : null}
          </ul>
        </nav>

        <nav aria-label="Primary navigation" className="usa-nav prime-nav">
          <ul className="usa-nav__primary usa-accordion">
            {canViewSettings ? (
              <li className="usa-nav__primary-item">
                <LinkWithQuery
                  to={`/dashboard`}
                  onClick={() => setMenuVisible(false)}
                  className={getNavItemClassName}
                  id="dashboard-nav-link"
                >
                  Dashboard
                </LinkWithQuery>
              </li>
            ) : null}
            {canViewTestQueue ? (
              <li className="usa-nav__primary-item">
                <LinkWithQuery
                  to={`/queue`}
                  onClick={() => setMenuVisible(false)}
                  className={getNavItemClassName}
                  id="conduct-test-nav-link"
                >
                  Conduct tests
                </LinkWithQuery>
              </li>
            ) : null}
            {canViewResults ? (
              <li className="usa-nav__primary-item">
                <LinkWithQuery
                  to={`/results`}
                  onClick={() => setMenuVisible(false)}
                  className={getNavItemClassName}
                  id="results-nav-link"
                >
                  Results
                </LinkWithQuery>
              </li>
            ) : null}
            {canViewPeople ? (
              <li className="usa-nav__primary-item">
                <LinkWithQuery
                  to={`/patients`}
                  onClick={() => setMenuVisible(false)}
                  className={getNavItemClassName}
                  id="patient-nav-link"
                >
                  {PATIENT_TERM_PLURAL_CAP}
                </LinkWithQuery>
              </li>
            ) : null}
          </ul>
          {facilities && facilities.length > 0 ? (
            <div className="prime-facility-select">
              <Dropdown
                selectedValue={facility.id}
                onChange={onFacilitySelect}
                options={facilities.map(({ name, id }) => ({
                  label: name,
                  value: id,
                }))}
              />
            </div>
          ) : null}
          <ul className="usa-nav__primary usa-accordion">
            <li className="usa-nav__primary-item nav__primary-item-icon">
              <LinkWithQuery
                to={`#`}
                onClick={(e) => {
                  e.preventDefault();
                  setStaffDetailsVisible(!staffDetailsVisible);
                }}
                className={() =>
                  staffDetailsVisible ? activeNavItem : inactiveNavItem
                }
                data-testid="user-button"
              >
                <FontAwesomeIcon
                  icon={"user-circle"}
                  style={{
                    color: staffDetailsVisible ? "white" : "",
                  }}
                />
              </LinkWithQuery>
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
                  <li className="usa-sidenav__item">
                    <span>
                      <strong>Role: </strong>
                      {formatRole(user.roleDescription)}
                    </span>
                  </li>
                  <li className="usa-sidenav__item">{facility.name}</li>
                  <li className="usa-sidenav__item navlink__support">
                    <a
                      href="https://www.simplereport.gov/support"
                      target="none"
                      onClick={() => handleSupportClick()}
                      data-testid="support-link"
                    >
                      Support
                    </a>
                  </li>
                  <li className="usa-sidenav__item margin-top-2">
                    <Button
                      variant="unstyled"
                      label=" Log out"
                      onClick={logout}
                    />
                  </li>
                  <ChangeUser />
                </ul>
              </div>
            </li>
            {canViewSettings ? (
              <li className="usa-nav__primary-item nav__primary-item-icon">
                <LinkWithQuery
                  to={`/settings`}
                  onClick={() => setMenuVisible(false)}
                  className={({ isActive }) =>
                    isActive ? "active-nav-item" : ""
                  }
                  style={({ isActive }) => ({ color: isActive ? "white" : "" })}
                >
                  <FontAwesomeIcon icon={"cog"} />
                </LinkWithQuery>
              </li>
            ) : null}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default connect()(Header);
