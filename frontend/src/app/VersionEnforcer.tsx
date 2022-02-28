import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { VersionService } from "./VersionService";

const VersionEnforcer = () => {
  const location = useLocation();

  useEffect(() => {
    VersionService.enforce();
  }, [location]);

  return null;
};

export default VersionEnforcer;
