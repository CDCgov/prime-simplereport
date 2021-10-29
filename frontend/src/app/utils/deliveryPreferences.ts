import {
  TestResultDeliveryPreference,
  TestResultDeliveryPreferences,
} from "../patients/TestResultDeliveryPreference";

const { SMS, EMAIL, ALL, NONE } = TestResultDeliveryPreferences;

export const toggleDeliveryPreferenceSms = toggleDeliveryPreference(SMS);
export const toggleDeliveryPreferenceEmail = toggleDeliveryPreference(EMAIL);

export const getSelectedDeliveryPreferencesSms = getSelectedDeliveryPreference(
  SMS
);
export const getSelectedDeliveryPreferencesEmail = getSelectedDeliveryPreference(
  EMAIL
);

function toggleDeliveryPreference(field: TestResultDeliveryPreference) {
  return function handleToggle(
    oldPreference: TestResultDeliveryPreference,
    newPreference: TestResultDeliveryPreference
  ): TestResultDeliveryPreference {
    const deliveryPreferences = new Set<TestResultDeliveryPreference>();

    if (oldPreference === SMS || oldPreference === ALL) {
      deliveryPreferences.add(SMS);
    }

    if (oldPreference === EMAIL || oldPreference === ALL) {
      deliveryPreferences.add(EMAIL);
    }

    if (newPreference === field) {
      deliveryPreferences.add(field);
    }

    if (newPreference === NONE) {
      deliveryPreferences.delete(field);
    }

    switch (deliveryPreferences.size) {
      case 0:
        return NONE;
      case 1:
        return Array.from(deliveryPreferences)[0];
      case 2:
        return ALL;
      default:
        return NONE;
    }
  };
}

export function getSelectedDeliveryPreference(
  field: TestResultDeliveryPreference
) {
  return function getSelectedDeliveryPreference(
    testResultDeliveryPreference: TestResultDeliveryPreference
  ) {
    return [field, ALL].includes(testResultDeliveryPreference) ? field : NONE;
  };
}
