import { getTestRegistrations } from "../../query/testRegistrations";

export const ADD_TEST_REGISTRATION = "ADD_TEST_REGISTRATION";
export const TEST_REGISTRATIONS__RECEIVE = "TEST_REGISTRATIONS__RECEIVE";

export const addTestRegistrationAction = (text) => {
  return {
    type: ADD_TEST_REGISTRATION,
    payload: text,
  };
};

export const receivedTestRegistration = (testRegistrations) => {
  return {
    type: TEST_REGISTRATIONS__RECEIVE,
    payload: testRegistrations,
  };
};

export const loadTestRegistrations = (organizationId) => {
  return (dispatch) => {
    return getTestRegistrations(organizationId).then((testRegistrations) =>
      dispatch(receivedTestRegistration(testRegistrations))
    );
  };
};
