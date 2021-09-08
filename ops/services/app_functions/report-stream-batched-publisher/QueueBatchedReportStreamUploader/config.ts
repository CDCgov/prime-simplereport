export function fetchFromEnvironmentOrThrow(
  variableName: string,
  description: string
): string {
  const value = process.env[variableName];
  if (value !== undefined) {
    return value;
  }

  throw new Error(
    `The ${description} must be provided via the ${variableName} environment variable, but this variable was empty.`
  );
}

export const ENV = (() => {
  const CONFIG_VALUES = {
    AZ_QUEUE_SERVICE_URL: "Azure Storage Queue service URL",
    TEST_EVENT_QUEUE_NAME: "storage queue resource name for Test Events",
    REPORT_STREAM_URL: "ReportStream URL to which tests should be reported",
    REPORT_STREAM_TOKEN: "ReportStream API key",
    REPORT_STREAM_BATCH_MINIMUM: "minimum # of messages to read from the queue",
    REPORT_STREAM_BATCH_MAXIMUM:
      "maximum # of messages to send to ReportStream",
  };
  return Object.entries(CONFIG_VALUES).reduce((acc, cur) => {
    const [configName, description] = [
      cur[0] as keyof typeof CONFIG_VALUES,
      cur[1],
    ];
    acc[configName] = fetchFromEnvironmentOrThrow(configName, description);
    return acc;
  }, {} as { [k in keyof typeof CONFIG_VALUES]: string });
})();
