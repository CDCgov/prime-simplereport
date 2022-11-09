import React from "react";
import { connect, useSelector } from "react-redux";

import { hasPermission, appPermissions } from "../permissions";
import Header from "../commonComponents/Header";

const UploaderHeader: React.FC = () => {
  const user = useSelector((state) => (state as any).user as User);

  const canViewResults = hasPermission(
    user.permissions,
    appPermissions.results.canView
  );

  const activeNavItem = "active-nav-item prime-nav-link";
  const inactiveNavItem = "prime-nav-link";
  const getNavItemClassName = ({ isActive }: { isActive: boolean }) =>
    isActive ? activeNavItem : inactiveNavItem;

  const mainNavContent = [
    {
      url: "/csv-uploads/submit",
      displayText: "Home",
      displayPermissions: canViewResults,
      className: getNavItemClassName,
      key: "uploads-home-nav-link",
    },
    {
      url: "/csv-uploads/history",
      displayText: "History",
      displayPermissions: canViewResults,
      className: getNavItemClassName,
      key: "uploads-history-nav-link",
    },
    {
      url: "/csv-uploads/guide",
      displayText: "Guide",
      displayPermissions: canViewResults,
      className: getNavItemClassName,
      key: "uploads-guide-nav-link",
    },
    {
      url: "/csv-uploads/code-lookup",
      displayText: "Device code lookup",
      displayPermissions: canViewResults,
      className: getNavItemClassName,
      key: "uploads-lookup-nav-link",
    },
  ];
  return (
    <Header
      menuItems={mainNavContent}
      inactiveNavItem={inactiveNavItem}
      activeNavItem={activeNavItem}
      getNavItemClassName={getNavItemClassName}
      showFacilitySelect={false}
    />
  );
};

export default connect()(UploaderHeader);
