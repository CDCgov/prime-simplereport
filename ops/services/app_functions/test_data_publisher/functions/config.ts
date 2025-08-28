const DESC = {
  AZ_STORAGE_QUEUE_SVC_URL: "Azure Storage queue service URL",
  AZ_STORAGE_ACCOUNT_NAME: "Azure Storage Account name",
  AZ_STORAGE_ACCOUNT_KEY: "Azure Storage Account access key",
  AIMS_ACCESS_KEY_ID: "AWS access key ID for connecting to AIMS",
  AIMS_SECRET_ACCESS_KEY: "AWS secret access key for connecting to AIMS",
  AIMS_KMS_ENCRYPTION_KEY: "KMS encryption key for sending data to AIMS",
  AIMS_USER_ID: "AIMS user ID for S3 object key prefix",
  AIMS_ENVIRONMENT: "AIMS environment (Test or Prod) for filename formatting",
  AIMS_BUCKET_NAME: "destination endpoint for sending data to AIMS",
};

function valOrThrow(name: keyof typeof DESC) {
  const raw = (process.env[name] ?? "").trim();

  console.log(
    `ENV ${name}: ${raw.substring(0, 50)}${raw.length > 50 ? "..." : ""}`,
  );

  if (!raw) {
    const error = `MissingEnv:${name} (${DESC[name]})`;
    console.error(error);
    throw new Error(error);
  }

  if (/^@Microsoft\.KeyVault\((SecretUri=|VaultName=)/i.test(raw)) {
    const error = `KeyVaultReferenceNotResolved:${name} (${DESC[name]}) - Key Vault secret not resolved. Function app may need restart or identity permissions check.`;
    console.error(error);
    throw new Error(error);
  }

  return raw;
}

let memo: { [K in keyof typeof DESC]: string } | null = null;

export function getEnv() {
  if (!memo) {
    const cfg = {} as { [K in keyof typeof DESC]: string };
    (Object.keys(DESC) as (keyof typeof DESC)[]).forEach((k) => {
      cfg[k] = valOrThrow(k);
    });
    memo = cfg;
    console.log("Environment variables successfully resolved and cached");
  }
  return memo;
}

export const ENV = new Proxy({} as { [K in keyof typeof DESC]: string }, {
  get(target, prop) {
    return getEnv()[prop as keyof typeof DESC];
  },
});
