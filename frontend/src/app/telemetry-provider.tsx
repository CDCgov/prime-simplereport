import React, { useEffect } from "react";

import { ai } from "./TelemetryService";

const TelemetryProvider: React.FC = ({ children }) => {
  useEffect(() => {
    ai.initialize();
  });

  return <>{children}</>;
};

export default TelemetryProvider;
