import { useEffect, useState } from "react";

import Alert from "./Alert";
import "./MaintenanceBanner.scss";

interface MaintenanceMode {
  active: boolean;
  header: string;
  message: string;
}

export const MaintenanceBanner: React.FC = () => {
  const [maintenanceMode, setMaintenanceMode] = useState<MaintenanceMode>({
    active: false,
    header: "",
    message: "",
  });
  useEffect(() => {
    const getMaintenanceMode = async () => {
      const maintenanceUrl = `/maintenance.json?v=${Date.now()}`;
      const maintenance = await fetch(maintenanceUrl);
      if (maintenance) {
        try {
          const maintenanceJSON = await maintenance.json();
          setMaintenanceMode(maintenanceJSON);
        } catch (e: any) {
          console.error(e);
        }
      }
    };
    getMaintenanceMode();
  }, []);

  return (
    <>
      {maintenanceMode.active ? (
        <div className="maintenance-alert-background border-top border-base-lighter">
          <Alert
            type="emergency"
            role="alert"
            className={"margin-left-auto margin-right-auto"}
            bodyClassName={"maintenance-alert-body"}
          >
            <strong>{maintenanceMode.header || "SimpleReport alert:"}</strong>{" "}
            {maintenanceMode.message}
          </Alert>
        </div>
      ) : null}
    </>
  );
};
