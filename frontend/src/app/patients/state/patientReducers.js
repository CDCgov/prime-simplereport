import {
  PATIENTS__RECEIVED_PATIENTS,
  PATIENTS__REQUEST_PATIENTS,
} from "././patientActionTypes";

const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case PATIENTS__REQUEST_PATIENTS:
      // just used for logging
      return state;
    case PATIENTS__RECEIVED_PATIENTS:
      let newPatients = {};
      action.payload.forEach((patient) => {
        newPatients[patient.patientId] = patient;
      });
      return {
        ...state,
        ...newPatients,
      };
    default:
      return state;
  }
};
