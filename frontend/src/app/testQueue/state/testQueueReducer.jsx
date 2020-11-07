import {
  TEST_QUEUE__ADD_PATIENT,
  TEST_QUEUE__REMOVE_PATIENT,
  TEST_QUEUE__UPDATE_PATIENT,
} from "./testQueueActionTypes";

export default (state = {}, action) => {
  switch (action.type) {
    case TEST_QUEUE__ADD_PATIENT: {
      const { patientId, dateAdded, askOnEntry } = { ...action.payload };
      return {
        ...state,
        patients: {
          ...state.patients,
          [patientId]: {
            dateAdded,
            askOnEntry,
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
    case TEST_QUEUE__UPDATE_PATIENT: {
      const { patientId, askOnEntry, dateUpdated } = { ...action.payload };
      const newEntry = {
        ...state.patients[patientId],
        dateUpdated,
        askOnEntry,
      };
      return {
        ...state,
        patients: {
          ...state.patients,
          [patientId]: newEntry,
        },
      };
    }
    default:
      return state;
  }
};
