import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import {
  PATIENTS__RECEIVED_PATIENTS,
  PATIENTS__REQUEST_PATIENTS,
  PATIENTS__UPDATE_PATIENT,
} from "././patientActionTypes";

const initialState = {
  abc123: {
    patientId: "abc123",
    firstName: "Edward",
    middleName: "",
    lastName: "Teach",
    birthDate: "01/01/1717",
    address: "123 Plank St, Nassau",
    phone: "(123) 456-7890",
  },
};

export default (state = {}, action) => {
  switch (action.type) {
    case PATIENTS__REQUEST_PATIENTS:
      return state;
    case PATIENTS__UPDATE_PATIENT:
      let patientId = action.payload.patientId;
      return {
        ...state,
        [patientId]: {
          ...state[patientId],
          firstName: action.payload.name,
        },
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
