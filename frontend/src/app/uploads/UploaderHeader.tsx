import React from "react";
import { useSelector } from "react-redux";

import { hasPermission, appPermissions } from "../permissions";
import Header from "../commonComponents/Header";

const UploaderHeader: React.FC = () => {
  const user = useSelector((state) => (state as any).user as User);

  const canViewResults = hasPermission(
    user.permissions,
    appPermissions.results.canView
  );

  const mainNavContent = [
    {
      url: "/csv-uploads/submit",
      displayText: "Home",
      displayPermissions: canViewResults,
      key: "uploads-home-nav-link",
    },
    {
      url: "/csv-uploads/history",
      displayText: "History",
      displayPermissions: canViewResults,
      key: "uploads-history-nav-link",
    },
    {
      url: "/csv-uploads/guide",
      displayText: "Guide",
      displayPermissions: canViewResults,
      key: "uploads-guide-nav-link",
    },
    {
      url: "/csv-uploads/code-lookup",
      displayText: "Device code lookup",
      displayPermissions: canViewResults,
      key: "uploads-lookup-nav-link",
    },
  ];
  return (
    <Header
      menuItems={mainNavContent}
      siteLogoLinkPath={"/csv-uploads"}
      showFacilitySelect={false}
    />
  );
};

export default UploaderHeader;
