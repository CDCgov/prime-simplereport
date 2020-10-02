import { sampleTestRegistrations } from "../app/test/data/testRegistration";
import { COVID_RESULTS } from "../app/constants";

export const getTestRegistrations = async (organizationId) => {
  return sampleTestRegistrations;
};

export const getTestResult = async (testRegistrationId) => {
  /* needs more info, like test date, machine date, etc */
  return {
    testResult: COVID_RESULTS.DETECTED,
    ...sampleTestRegistrations.find(
      (sampleTestRegistration) =>
        sampleTestRegistration.testRegistrationId === testRegistrationId
    ),
  };
};
