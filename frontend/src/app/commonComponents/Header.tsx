import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { v4 as uuidv4 } from "uuid";
import { useSelector, connect } from "react-redux";

import { PATIENT_TERM_PLURAL_CAP } from "../../config/constants";
import siteLogo from "../../img/simplereport-logo-black.svg";
import { hasPermission, appPermissions } from "../permissions";
import { RootState } from "../store";
import { useSelectedFacility } from "../facilitySelect/useSelectedFacility";
import { getAppInsights } from "../TelemetryService";
import { formatFullName, formatRole } from "../utils/user";
import TouchpointsButton from "../analytics/TouchpointsButton";

import useComponentVisible from "./ComponentVisible";
import { LinkWithQuery } from "./LinkWithQuery";
import "./Header.scss";
import Button from "./Button/Button";
import ChangeUser from "./ChangeUser";
import Dropdown from "./Dropdown";
import USAGovBanner from "./USAGovBanner";

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
    const oktaDomain = process.env.REACT_APP_OKTA_URL;
    window.location.replace(
      oktaDomain +
        "/oauth2/default/v1/logout" +
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
      key: "dashboard-nav-link",
    },
    {
      url: "/queue",
      displayText: "Report tests",
      displayPermissions: canViewTestQueue,
      className: getNavItemClassName,
      key: "report-test-nav-link",
    },
    {
      url: "/results",
      displayText: "Results",
      displayPermissions: canViewResults,
      className: getNavItemClassName,
      key: "results-nav-link",
    },
    {
      url: "/patients",
      displayText: PATIENT_TERM_PLURAL_CAP,
      displayPermissions: canViewPeople,
      className: getNavItemClassName,
      key: "patient-nav-link",
    },
  ];
  const mainNavList = (deviceType: "desktop" | "mobile") => {
    let navList = mainNavContent
      .map((item) => {
        return (
          item.displayPermissions && (
            <li key={item.key} className="usa-nav__primary-item">
              <LinkWithQuery
                to={item.url}
                onClick={() => setMenuVisible(false)}
                className={item.className}
                id={`${deviceType}-${item.key}`}
                data-cy={`${deviceType}-${item.key}`}
              >
                {item.displayText}
              </LinkWithQuery>
            </li>
          )
        );
      })
      .filter((item) => item);
    if (deviceType === "mobile" && navList?.length > 0) {
      return (
        <ul className="usa-nav__primary usa-accordion mobile-main-nav-container">
          {navList}
        </ul>
      );
    } else if (deviceType === "desktop" && navList?.length > 0) {
      return <ul className="usa-nav__primary usa-accordion">{navList}</ul>;
    }
  };

  const secondaryNavContent = [
    {
      url: "#",
      displayPermissions: true,
      onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        setStaffDetailsVisible(!staffDetailsVisible);
      },
      className: staffDetailsVisible ? activeNavItem : inactiveNavItem,
      dataTestId: "user-button",
      hasSubmenu: true,
      icon: (
        <FontAwesomeIcon
          icon={"user-circle"}
          aria-hidden={false}
          aria-label={"My account"}
          role={"img"}
          style={{
            color: staffDetailsVisible && !menuVisible ? "white" : "",
          }}
        />
      ),
      mobileDisplay: false,
    },
    {
      url: "/settings/users/1",
      displayPermissions: true,
      onClick: () => setMenuVisible(false),
      className: getNavItemClassName,
      dataTestId: "settings-button",
      icon: (
        <FontAwesomeIcon
          icon={"cog"}
          aria-hidden={false}
          role={"img"}
          aria-label={"Settings"}
        />
      ),
      mobileDisplay: true,
      mobileDisplayText: "Settings",
      hasSubmenu: false,
    },
  ];
  const secondaryNavSublist = (deviceType: string) => (
    <ul className="usa-sidenav__sublist">
      <li className="usa-sidenav__item span-full-name">
        {formatFullName(user)}
      </li>
      <li className="usa-sidenav__item role-tag">
        {formatRole(user.roleDescription)}
      </li>
      <li className="usa-sidenav__item navlink__support">
        <div className="header-link-icon sparkle-icon-mask"></div>
        <a
          href="https://www.simplereport.gov/using-simplereport/whats-new"
          target="_blank"
          rel="noreferrer"
          onClick={() => handleWhatsNewClick()}
          data-testid={`${deviceType}-whats-new-link`}
        >
          What's new
        </a>
      </li>
      <li className="usa-sidenav__item navlink__support">
        <FontAwesomeIcon
          className={"header-link-icon"}
          icon={"question-circle"}
        />
        <a
          href="https://www.simplereport.gov/support"
          target="none"
          onClick={() => handleSupportClick()}
          data-testid={`${deviceType}-support-link`}
        >
          Support
        </a>
      </li>
      <li className="usa-sidenav__item navlink__support">
        <FontAwesomeIcon className={"header-link-icon"} icon={"sign-out-alt"} />
        <Button variant="unstyled" label=" Log out" onClick={logout} />
      </li>
      <ChangeUser />
    </ul>
  );
  const secondaryNav = (deviceType: string) => {
    let content = secondaryNavContent;
    if (deviceType === "mobile") {
      content = secondaryNavContent.filter((item) => item.mobileDisplay);
    }
    return content.map((item) => {
      return (
        <li
          key={`${deviceType}-${item.dataTestId}`}
          className="usa-nav__primary-item nav__primary-item-icon"
        >
          <LinkWithQuery
            to={item.url}
            onClick={item.onClick}
            className={item.className}
            data-testid={`${deviceType}-${item.dataTestId}`}
            id={`${deviceType}-${item.dataTestId}`}
            role={item.hasSubmenu ? "button" : "link"}
            aria-expanded={item.hasSubmenu ? staffDetailsVisible : undefined}
            aria-controls={
              item.hasSubmenu
                ? `${deviceType}-${item.dataTestId}-submenu`
                : undefined
            }
          >
            {deviceType === "desktop" ? item.icon : item.mobileDisplayText}
          </LinkWithQuery>
          {item.hasSubmenu &&
          staffDetailsVisible &&
          deviceType === "desktop" ? (
            <div
              id={`${deviceType}-${item.dataTestId}-submenu`}
              ref={staffDefailsRef}
              aria-label="Account navigation"
              className={classNames("prime-staff-infobox", {
                "is-prime-staff-infobox-visible": staffDetailsVisible,
              })}
            >
              {secondaryNavSublist("desktop")}
            </div>
          ) : (
            <></>
          )}
        </li>
      );
    });
  };

  return (
    <header className="usa-header usa-header--basic">
      <USAGovBanner />

      <div className="usa-nav-container prime-header">
        <div className="usa-navbar">
          <div className="usa-logo" id="basic-logo">
            <LinkWithQuery to={siteLogoLinkPath} title="Home" aria-label="Home">
              <img
                className="width-card desktop:width-full"
                src={siteLogo}
                alt={process.env.REACT_APP_TITLE}
              />
            </LinkWithQuery>
            <div className="prime-organization-name margin-left-4">
              {organization.name}
            </div>
          </div>

          <button
            onClick={() => setMenuVisible(!menuVisible)}
            className="usa-menu-btn"
          >
            Menu
          </button>

          <nav
            aria-label="Primary mobile navigation"
            className={classNames(
              "usa-nav",
              "prime-nav",
              "desktop:display-none",
              {
                "is-visible": menuVisible,
              },
              "mobile-nav"
            )}
          >
            <button
              className="fa-layers fa-fw fa-2x usa-nav__close prime-nav-close-button"
              onClick={() => setMenuVisible(false)}
              title={"close menu"}
            >
              <FontAwesomeIcon icon={"window-close"} />
            </button>
            {mainNavList("mobile")}
            <ul className="usa-nav__primary usa-accordion mobile-secondary-nav-container">
              {secondaryNav("mobile")}
            </ul>
            <div className="usa-nav__primary mobile-sublist-container">
              {secondaryNavSublist("mobile")}
              <label id="mobile-facility-label" className="usa-label ">
                Facility
              </label>
              <div className="prime-facility-select facility-select-mobile-container">
                <Dropdown
                  ariaLabel="Select testing facility"
                  selectedValue={facility.id}
                  onChange={onFacilitySelect}
                  className={"mobile-facility-select"}
                  options={facilities.map(({ name, id }) => ({
                    label: name,
                    value: id,
                  }))}
                />
              </div>

              <TouchpointsButton />
            </div>
          </nav>
        </div>

        <nav
          aria-label="Primary desktop navigation"
          className="usa-nav prime-nav desktop-nav"
        >
          {mainNavList("desktop")}
          {facilities && facilities.length > 0 ? (
            <div className="prime-facility-select">
              <Dropdown
                ariaLabel="Select testing facility"
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
            {secondaryNav("desktop")}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default connect()(Header);
