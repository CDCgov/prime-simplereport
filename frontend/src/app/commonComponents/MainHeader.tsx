import React from "react";
import { useSelector } from "react-redux";

import { PATIENT_TERM_PLURAL_CAP } from "../../config/constants";
import { hasPermission, appPermissions } from "../permissions";

import "./Header.scss";
import Header from "./Header";

const MainHeader: React.FC = () => {
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

  const mainNavContent = [
    {
      url: "/dashboard",
      displayText: "Dashboard",
      displayPermissions: canViewSettings,
      key: "dashboard-nav-link",
    },
    {
      url: "/queue",
      displayText: "Conduct tests",
      displayPermissions: canViewTestQueue,
      key: "conduct-test-nav-link",
    },
    {
      url: "/results",
      displayText: "Results",
      displayPermissions: canViewResults,
      key: "results-nav-link",
    },
    {
      url: "/patients",
      displayText: PATIENT_TERM_PLURAL_CAP,
      displayPermissions: canViewPeople,
      key: "patient-nav-link",
    },
  ];
  return <Header menuItems={mainNavContent} showFacilitySelect={true} />;
};

export default MainHeader;
