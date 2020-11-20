import {
  PATIENTS__RECEIVED_PATIENTS,
  PATIENTS__REQUEST_PATIENTS,
  PATIENTS__UPDATE_PATIENT,
} from "././patientActionTypes";

export default (state = {}, action) => {
  switch (action.type) {
    case PATIENTS__REQUEST_PATIENTS:
      return state;
    case PATIENTS__UPDATE_PATIENT:
      const patient = action.patient;
      return {
        ...state,
        [patient.patientId]: patient,
      };
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
