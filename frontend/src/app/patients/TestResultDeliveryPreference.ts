export const TestResultDeliveryPreferences = {
  SMS: "SMS",
  EMAIL: "EMAIL",
  NONE: "NONE",
  ALL: "ALL",
} as const;

export type TestResultDeliveryPreference =
  typeof TestResultDeliveryPreferences[keyof typeof TestResultDeliveryPreferences];
