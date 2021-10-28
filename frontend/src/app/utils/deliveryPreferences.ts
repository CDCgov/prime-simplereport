import { TestResultDeliveryPreference } from "../patients/Components/PersonForm";
import TestResultDeliveryPreferences from "../patients/TestResultDeliveryPreferences";

const { SMS, EMAIL, ALL, NONE } = TestResultDeliveryPreferences;

export const toggleDeliveryPreferenceSms = toggleDeliveryPreference(SMS);
export const toggleDeliveryPreferenceEmail = toggleDeliveryPreference(EMAIL);

export const getSelectedDeliveryPreferencesSms = getSelectedDeliveryPreference(
  SMS
);
export const getSelectedDeliveryPreferencesEmail = getSelectedDeliveryPreference(
  EMAIL
);

function toggleDeliveryPreference(field: TestResultDeliveryPreferences) {
  return function handleToggle(
    preference: TestResultDeliveryPreference,
    newPreference: TestResultDeliveryPreference
  ): TestResultDeliveryPreference {
    const deliveryPreferences = new Set<TestResultDeliveryPreference>();

    if ([SMS, ALL].includes(preference as TestResultDeliveryPreferences)) {
      deliveryPreferences.add(SMS);
    }

    if ([EMAIL, ALL].includes(preference as TestResultDeliveryPreferences)) {
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
