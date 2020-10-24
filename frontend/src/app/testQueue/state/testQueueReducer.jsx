import {
  TEST_QUEUE__ADD_PATIENT,
  TEST_QUEUE__REMOVE_PATIENT,
  TEST_QUEUE__SHOW_NOTIFICATION,
  TEST_QUEUE__CLEAR_NOTIFICATION,
} from "./testQueueActionTypes";

export default (state = {}, action) => {
  switch (action.type) {
    case TEST_QUEUE__ADD_PATIENT: {
      const { patientId, dateAdded } = { ...action.payload };
      return {
        ...state,
        patients: {
          ...state.patients,
          [patientId]: {
            dateAdded,
          },
        },
      };
    }
    case TEST_QUEUE__REMOVE_PATIENT: {
      const patientId = action.payload.patientId;
      let newPatients = {
        ...state.patients,
      };
      delete newPatients[patientId];
      return {
        ...state,
        patients: newPatients,
      };
    }
    case TEST_QUEUE__SHOW_NOTIFICATION: {
      const { notificationType, patientId } = { ...action.payload };
      return {
        ...state,
        notifications: {
          notificationType,
          patientId,
        },
      };
    }
    case TEST_QUEUE__CLEAR_NOTIFICATION: {
      return {
        ...state,
        notifications: null,
      };
    }
    default:
      return state;
  }
};
