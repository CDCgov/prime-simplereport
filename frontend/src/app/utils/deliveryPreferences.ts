import {
  TestResultDeliveryPreference,
  TestResultDeliveryPreferences,
} from "../patients/TestResultDeliveryPreference";

const { SMS, EMAIL, ALL, NONE } = TestResultDeliveryPreferences;

export const toggleDeliveryPreferenceSms = toggleDeliveryPreference(SMS);
export const toggleDeliveryPreferenceEmail = toggleDeliveryPreference(EMAIL);

export const getSelectedDeliveryPreferencesSms =
  getSelectedDeliveryPreference(SMS);
export const getSelectedDeliveryPreferencesEmail =
  getSelectedDeliveryPreference(EMAIL);

function toggleDeliveryPreference(field: TestResultDeliveryPreference) {
  return (
    oldPreference: TestResultDeliveryPreference,
    newPreference: TestResultDeliveryPreference
  ): TestResultDeliveryPreference => {
    const deliveryPreferences = new Set<TestResultDeliveryPreference>();
    deliveryPreferences.add(getSelectedDeliveryPreferencesEmail(oldPreference));
    deliveryPreferences.add(getSelectedDeliveryPreferencesSms(oldPreference));

    if (newPreference === NONE) {
      deliveryPreferences.delete(field);
    } else {
      deliveryPreferences.add(field);
    }

    if (deliveryPreferences.has(SMS) && deliveryPreferences.has(EMAIL)) {
      return ALL;
    }
    if (deliveryPreferences.has(SMS)) {
      return SMS;
    }
    if (deliveryPreferences.has(EMAIL)) {
      return EMAIL;
    }
    return NONE;
  };
}

function getSelectedDeliveryPreference(field: TestResultDeliveryPreference) {
  return (testResultDeliveryPreference: TestResultDeliveryPreference) =>
    [field, ALL].includes(testResultDeliveryPreference) ? field : NONE;
}
