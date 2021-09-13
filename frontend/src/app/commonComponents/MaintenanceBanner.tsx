import { useEffect, useState } from "react";

import Alert from "./Alert";

interface MaintenanceMode {
  active: boolean;
  message?: string;
}

export const MaintenanceBanner: React.FC = () => {
  const [maintenanceMode, setMaintenanceMode] = useState<MaintenanceMode>({
    active: false,
  });
  useEffect(() => {
    const getMaintenanceMode = async () => {
      const maintenance = await fetch("/maintenance.json");
      const maintenanceJSON = await maintenance.json();
      setMaintenanceMode(maintenanceJSON);
    };
    getMaintenanceMode();
  }, []);

  return (
    <>
      {maintenanceMode.active ? (
        <div className="usa-site-alert usa-site-alert--emergency usa-site-alert--no-heading border-top border-base-lighter">
          <Alert type="emergency" role="alert">
            <strong>SimpleReport is currently experiencing an outage.</strong>{" "}
            {maintenanceMode?.message}
          </Alert>
        </div>
      ) : null}
    </>
  );
};
