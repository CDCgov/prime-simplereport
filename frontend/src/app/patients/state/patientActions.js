import { getPatients } from "../../query/patients";
import {
  PATIENTS__REQUEST_PATIENTS,
  PATIENTS__RECEIVED_PATIENTS,
  PATIENTS__UPDATE_PATIENT,
} from "./patientActionTypes";

const receivedPatient = (patients) => {
  return {
    type: PATIENTS__RECEIVED_PATIENTS,
    payload: patients,
  };
};

// signals that a request is being made
const requestPatients = (organizationId) => {
  return {
    type: PATIENTS__REQUEST_PATIENTS,
    payload: organizationId,
  };
};

export const updatePatient = (patient) => {
  return {
    type: PATIENTS__UPDATE_PATIENT,
    patient,
  };
};

export const loadPatients = (organizationId) => {
  return (dispatch) => {
    // first, inform that the API call is starting
    dispatch(requestPatients(organizationId));

    // return a promise
    return getPatients(organizationId).then((patients) =>
      dispatch(receivedPatient(patients))
    );
  };
};
