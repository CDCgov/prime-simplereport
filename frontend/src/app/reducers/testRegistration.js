import {
  ADD_TEST_REGISTRATION,
  TEST_REGISTRATIONS__RECEIVE,
} from "../actions/addTestRegistration";

const initialState = { testRegistrations: [] };

export default (state = initialState, action) => {
  switch (action.type) {
    case ADD_TEST_REGISTRATION:
      return {
        ...state,
        testRegistrations: [...state.testRegistrations, action.payload],
      };
    case TEST_REGISTRATIONS__RECEIVE:
      return {
        ...state,
        testRegistrations: action.payload,
      };
    default:
      return state;
  }
};
