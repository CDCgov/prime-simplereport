import React from "react";
import { useSelector, connect } from "react-redux";

import { PATIENT_TERM_PLURAL_CAP } from "../../config/constants";
import { hasPermission, appPermissions } from "../permissions";

import "./Header.scss";
import Header from "./Header";

const MainHeader: React.FC<{}> = () => {
  const user = useSelector((state) => (state as any).user as User);

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
      displayText: "Conduct tests",
      displayPermissions: canViewTestQueue,
      className: getNavItemClassName,
      key: "conduct-test-nav-link",
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
  return <Header menuItems={mainNavContent} />;
};

export default connect(MainHeader);
