import moment from "moment";

// import { QUEUE_NOTIFICATION_TYPES } from "../constants";
import { DEVICES__ADD_DEVICE } from "./deviecsActionTypes";

const addNewDevice = (patientId) => {
  return {
    type: DEVICES__ADD_DEVICE,
    payload: {
      patientId,
      dateAdded: moment().toISOString(),
    },
  };
};
