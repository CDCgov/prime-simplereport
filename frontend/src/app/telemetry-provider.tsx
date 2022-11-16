import React, { useEffect } from "react";

import { ai } from "./TelemetryService";

type TelemetryProviderProps = {
  children: React.ReactNode;
};

const TelemetryProvider = ({
  children,
}: TelemetryProviderProps): JSX.Element => {
  useEffect(() => {
    ai.initialize();
  });

  return <>{children}</>;
};

export default TelemetryProvider;
