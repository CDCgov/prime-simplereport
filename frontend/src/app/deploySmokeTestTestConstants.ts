type SpringHealthStatusValues = "UP" | "DOWN" | "OKTA_DEGRADED";
export const generateBackendApiHealthResponse = (
  overallStatus?: SpringHealthStatusValues,
  oktaStatus?: SpringHealthStatusValues
) => {
  return {
    status: overallStatus ?? "UP",
    components: {
      "backend-and-db-smoke-test": {
        status: "UP",
      },
      db: {
        status: "UP",
        components: {
          metabaseDataSource: {
            status: "UP",
          },
          primaryDataSource: {
            status: "UP",
          },
        },
      },
      discoveryComposite: {
        description: "Discovery Client not initialized",
        status: "UNKNOWN",
        components: {
          discoveryClient: {
            description: "Discovery Client not initialized",
            status: "UNKNOWN",
          },
        },
      },
      diskSpace: {
        status: "UP",
      },
      livenessState: {
        status: "UP",
      },
      okta: {
        status: oktaStatus ?? "UP",
      },
      ping: {
        status: "UP",
      },
      readinessState: {
        status: "UP",
      },
      refreshScope: {
        status: "UP",
      },
    },
    groups: ["liveness", "readiness"],
  };
};
