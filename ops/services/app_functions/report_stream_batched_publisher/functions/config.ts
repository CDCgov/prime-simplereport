export function fetchFromEnvironmentOrThrow(
  variableName: string,
  description: string,
): string {
  const value = process.env[variableName];
  if (value !== undefined) {
    return value;
  }

  throw new Error(
    `The ${description} must be provided via the ${variableName} environment variable, but this variable was empty.`,
  );
}

export const uploaderVersion = "2021-09-21";

export const ENV = (() => {
  const CONFIG_VALUES = {
    AZ_STORAGE_QUEUE_SVC_URL: "Azure Storage Queue service URL",
    AZ_STORAGE_ACCOUNT_NAME: "Azure Account Name",
    AZ_STORAGE_ACCOUNT_KEY: "Azure Account Key",
    TEST_EVENT_QUEUE_NAME: "storage queue resource name for Test Events",
    REPORTING_EXCEPTION_QUEUE_NAME:
      "storage queue resource name for exceptions in publishing to ReportStream",
    PUBLISHING_ERROR_QUEUE_NAME:
      "storage queue resource name for HTTP 400 errors in publishing to ReportStream",
    FHIR_TEST_EVENT_QUEUE_NAME:
      "storage queue resource name for Test Events in the FHIR standard",
    FHIR_PUBLISHING_ERROR_QUEUE_NAME:
      "storage queue resource name for HTTP 400 errors in publishing to ReportStream for Test Events in the FHIR standard",
    REPORT_STREAM_URL: "ReportStream URL to which tests should be reported",
    REPORT_STREAM_BASE_URL: "ReportStream base url",
    REPORT_STREAM_TOKEN: "ReportStream API key",
    FHIR_REPORT_STREAM_KEY:
      "private key to perform token-based auth with ReportStream and publish FHIR test events",
    REPORT_STREAM_BATCH_MINIMUM: "minimum # of messages to read from the queue",
    REPORT_STREAM_BATCH_MAXIMUM:
      "maximum # of messages to send to ReportStream",
    SIMPLE_REPORT_CB_URL:
      "SimpleReport webhook URL for ReportStream exceptions",
    SIMPLE_REPORT_CB_TOKEN:
      "API token for the SimpleReport webhook for ReportStream exceptions",
  };
  return Object.entries(CONFIG_VALUES).reduce(
    (acc, cur) => {
      const [configName, description] = [
        cur[0] as keyof typeof CONFIG_VALUES,
        cur[1],
      ];
      acc[configName] = fetchFromEnvironmentOrThrow(configName, description);
      return acc;
    },
    {} as { [k in keyof typeof CONFIG_VALUES]: string },
  );
})();
