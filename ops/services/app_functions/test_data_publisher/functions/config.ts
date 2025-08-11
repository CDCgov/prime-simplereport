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

export const ENV = (() => {
  const CONFIG_VALUES = {
    AZ_STORAGE_QUEUE_SVC_URL: "Azure Storage queue service URL",
    AZ_STORAGE_ACCOUNT_NAME: "Azure Storage Account name",
    AZ_STORAGE_ACCOUNT_KEY: "Azure Storage Account access key",
    AIMS_ACCESS_KEY_ID: "AWS access key ID for connecting to AIMS",
    AIMS_SECRET_ACCESS_KEY: "AWS secret access key for connecting to AIMS",
    AIMS_KMS_ENCRYPTION_KEY: "KMS encryption key for sending data to AIMS",
    AIMS_OUTBOUND_ENDPOINT: "destination endpoint for sending data to AIMS",
    AIMS_USER_ID: "AIMS user ID for S3 object key prefix",
    AIMS_ENVIRONMENT: "AIMS environment (Test or Prod) for filename formatting",
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
