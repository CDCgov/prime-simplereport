import React, { useEffect } from "react";

import { ai } from "./TelemetryService";

type TelemetryProviderProps = {
  children: React.ReactNode;
};

const TelemetryProvider: React.FC<TelemetryProviderProps> = ({ children }) => {
  useEffect(() => {
    ai.initialize();
  });

  return <>{children}</>;
};

export default TelemetryProvider;
