import React from "react";

import { MaintenanceBanner } from "./app/commonComponents/MaintenanceBanner";

interface MaintenanceWrapperProps {
  children: React.ReactNode;
}

const MaintenanceWrapper: React.FC<MaintenanceWrapperProps> = ({
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

export default MaintenanceWrapper;
