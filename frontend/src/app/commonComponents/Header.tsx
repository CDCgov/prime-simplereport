import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { v4 as uuidv4 } from "uuid";
import { useSelector, connect } from "react-redux";

import { formatFullName, formatRole } from "../utils/user";
import { PATIENT_TERM_PLURAL_CAP } from "../../config/constants";
import siteLogo from "../../img/simplereport-logo-color.svg";
import { hasPermission, appPermissions } from "../permissions";
import { RootState } from "../store";
import { useSelectedFacility } from "../facilitySelect/useSelectedFacility";
import { getAppInsights } from "../TelemetryService";

import Button from "./Button/Button";
import Dropdown from "./Dropdown";
import useComponentVisible from "./ComponentVisible";
import { LinkWithQuery } from "./LinkWithQuery";

import "./Header.scss";
import ChangeUser from "./ChangeUser";

const Header: React.FC<{}> = () => {
  const appInsights = getAppInsights();

  const handleSupportClick = () => {
    if (appInsights) {
      appInsights.trackEvent({ name: "Support" });
    }
  };

  const handleWhatsNewClick = () => {
    if (appInsights) {
      appInsights.trackEvent({ name: "What's new" });
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
  const mainNavContent = [
    {
      url: "/dashboard",
      displayText: "Dashboard",
      displayPermissions: canViewSettings,
      className: getNavItemClassName,
      id: "dashboard-nav-link",
    },
    {
      url: "/queue",
      displayText: "Conduct tests",
      displayPermissions: canViewTestQueue,
      className: getNavItemClassName,
      id: "conduct-test-nav-link",
    },
    {
      url: "/results",
      displayText: "Results",
      displayPermissions: canViewResults,
      className: getNavItemClassName,
      id: "results-nav-link",
    },
    {
      url: "/patients",
      displayText: PATIENT_TERM_PLURAL_CAP,
      displayPermissions: canViewPeople,
      className: getNavItemClassName,
      id: "patient-nav-link",
    },
  ];
  const secondaryNavContent = [
    {
      url: "#",
      displayPermissions: true,
      onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        setStaffDetailsVisible(!staffDetailsVisible);
      },
      className: staffDetailsVisible ? activeNavItem : inactiveNavItem,
      id: "results-nav-link",
      dataTestId: "user-button",
      hasSubmenu: true,
      icon: (
        <FontAwesomeIcon
          icon={"user-circle"}
          style={{
            color: staffDetailsVisible ? "white" : "",
          }}
        />
      ),
    },
    {
      url: "/settings",
      displayPermissions: true,
      onClick: () => setMenuVisible(false),
      className: getNavItemClassName,
      id: "results-nav-link",
      dataTestId: "user-button",
      icon: <FontAwesomeIcon icon={"cog"} />,
      hasSubmenu: false,
    },
  ];

  const secondaryNavSublist = (
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
        <Button variant="unstyled" label=" Log out" onClick={logout} />
      </li>
      <ChangeUser />
    </ul>
  );

  const mainNavList = mainNavContent.map((item) => {
    return (
      <li key={item.id} className="usa-nav__primary-item">
        {item.displayPermissions ? (
          <LinkWithQuery
            to={item.url}
            onClick={() => setMenuVisible(false)}
            className={item.className}
            id={item.id}
          >
            {item.displayText}
          </LinkWithQuery>
        ) : null}
      </li>
    );
  });

  const secondaryNavList = secondaryNavContent.map((item) => {
    return (
      <li className="usa-nav__primary-item nav__primary-item-icon">
        <LinkWithQuery
          to={item.url}
          onClick={item.onClick}
          className={item.className}
          data-testid={item.dataTestId}
        >
          {item.icon}
        </LinkWithQuery>
        {item.hasSubmenu && staffDetailsVisible ? (
          <div
            ref={staffDefailsRef}
            aria-label="Primary navigation"
            className={classNames("shadow-3", "prime-staff-infobox", {
              "is-prime-staff-infobox-visible": staffDetailsVisible,
            })}
          >
            {secondaryNavSublist}
          </div>
        ) : (
          <></>
        )}
      </li>
    );
  });

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
            <ul className="usa-nav__primary usa-accordion">{mainNavList}</ul>
            <ul className="usa-nav__primary usa-accordion">
              {secondaryNavContent.map((item) => {
                return (
                  <li className="usa-nav__primary-item nav__primary-item-icon">
                    <LinkWithQuery
                      to={item.url}
                      onClick={item.onClick}
                      className={item.className}
                      data-testid={item.dataTestId}
                    >
                      {item.icon}
                    </LinkWithQuery>
                    {item.hasSubmenu ? secondaryNavSublist : <></>}
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <nav aria-label="Primary navigation" className="usa-nav prime-nav">
          <ul className="usa-nav__primary usa-accordion">{mainNavList}</ul>
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
            {secondaryNavContent.map((item) => {
              return (
                <li className="usa-nav__primary-item nav__primary-item-icon">
                  <LinkWithQuery
                    to={item.url}
                    onClick={item.onClick}
                    className={item.className}
                    data-testid={item.dataTestId}
                  >
                    {item.icon}
                  </LinkWithQuery>
                  {item.hasSubmenu && staffDetailsVisible ? (
                    <div
                      ref={staffDefailsRef}
                      aria-label="Primary navigation"
                      className={classNames("shadow-3", "prime-staff-infobox", {
                        "is-prime-staff-infobox-visible": staffDetailsVisible,
                      })}
                    >
                      {secondaryNavSublist}
                    </div>
                  ) : (
                    <></>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default connect()(Header);
