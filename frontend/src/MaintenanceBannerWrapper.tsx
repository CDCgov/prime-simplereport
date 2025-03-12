import React from "react";

import { MaintenanceBanner } from "./app/commonComponents/MaintenanceBanner";

interface MaintenanceBannerWrapperProps {
  children: React.ReactNode;
}

const MaintenanceBannerWrapper: React.FC<MaintenanceBannerWrapperProps> = ({
  children,
}) => {
  return (
    <>
      {process.env.REACT_APP_DISABLE_MAINTENANCE_BANNER === "true" ? null : (
        <MaintenanceBanner />
      )}
      {children}
    </>
  );
};

export default MaintenanceBannerWrapper;
