import {
  TestResultDeliveryPreference,
  TestResultDeliveryPreferences,
} from "../patients/TestResultDeliveryPreference";

const { SMS, EMAIL, ALL, NONE } = TestResultDeliveryPreferences;

export const toggleDeliveryPreferenceSms = toggleDeliveryPreference.bind(
  null,
  SMS
);
export const toggleDeliveryPreferenceEmail = toggleDeliveryPreference.bind(
  null,
  EMAIL
);

export const getSelectedDeliveryPreferencesSms = getSelectedDeliveryPreference.bind(
  null,
  SMS
);
export const getSelectedDeliveryPreferencesEmail = getSelectedDeliveryPreference.bind(
  null,
  EMAIL
);

function toggleDeliveryPreference(
  field: TestResultDeliveryPreference,
  oldPreference: TestResultDeliveryPreference,
  newPreference: TestResultDeliveryPreference
): TestResultDeliveryPreference {
  // Place configured delivery preference(s) in a Set. If preference is `ALL`,
  // expand into its constituent options
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

  // Remove _only_ the delivery preference for the selected field - other
  // user selections will remain intact
  if (newPreference === NONE) {
    deliveryPreferences.delete(field);
  }

  // Translate set of preferences into the corresponding enum value
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
}

// Given a patient's test result delivery preference, determines the radio
// option that should be selected for test result delivery preference fields
// in forms
function getSelectedDeliveryPreference(
  field: TestResultDeliveryPreference,
  testResultDeliveryPreference: TestResultDeliveryPreference
): TestResultDeliveryPreference {
  return [field, ALL].includes(testResultDeliveryPreference) ? field : NONE;
}
