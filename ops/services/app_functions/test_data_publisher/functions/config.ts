function readEnv() {
  const v = (name: string, description: string) => {
    const raw = (process.env[name] ?? "").trim();

    if (/^@Microsoft\.KeyVault\((SecretUri=|VaultName=)/i.test(raw)) {
      throw new Error(
        `KeyVaultReferenceNotResolved:${name} - Key Vault secret not resolved. Function app may need restart or identity permissions check.`,
      );
    }

    if (!raw) {
      throw new Error(
        `MissingEnv:${name} - The ${description} must be provided via the ${name} environment variable, but this variable was empty.`,
      );
    }

    return raw;
  };

  return {
    AZ_STORAGE_QUEUE_SVC_URL: v(
      "AZ_STORAGE_QUEUE_SVC_URL",
      "Azure Storage queue service URL",
    ),
    AZ_STORAGE_ACCOUNT_NAME: v(
      "AZ_STORAGE_ACCOUNT_NAME",
      "Azure Storage Account name",
    ),
    AZ_STORAGE_ACCOUNT_KEY: v(
      "AZ_STORAGE_ACCOUNT_KEY",
      "Azure Storage Account access key",
    ),
    AIMS_ACCESS_KEY_ID: v(
      "AIMS_ACCESS_KEY_ID",
      "AWS access key ID for connecting to AIMS",
    ),
    AIMS_SECRET_ACCESS_KEY: v(
      "AIMS_SECRET_ACCESS_KEY",
      "AWS secret access key for connecting to AIMS",
    ),
    AIMS_KMS_ENCRYPTION_KEY: v(
      "AIMS_KMS_ENCRYPTION_KEY",
      "KMS encryption key for sending data to AIMS",
    ),
    AIMS_USER_ID: v("AIMS_USER_ID", "AIMS user ID for S3 object key prefix"),
    AIMS_ENVIRONMENT: v(
      "AIMS_ENVIRONMENT",
      "AIMS environment (Test or Prod) for filename formatting",
    ),
    AIMS_BUCKET_NAME: v(
      "AIMS_BUCKET_NAME",
      "destination endpoint for sending data to AIMS",
    ),
  };
}

export const ENV = readEnv();
