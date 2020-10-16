// import axios from "axios";

// import { ROOT_URL } from "../../config/constants";
import { demoPatients } from "../fakeData/patients";
// import { isLocalHost } from "../utils";
// import { mapApiDataToClient } from "../utils/mappers";
// import { patientMapping } from "../patients/mappings";

export const searchPatients = (searchQuery) => {
  // if (isLocalHost) {
  //   const url = `${ROOT_URL}/test_registrations`;
  //   const response = await axios.get(url);
  //   const rawpatients = response.data.items;
  //   const patients = rawpatients.map((rawpatient) =>
  //     mapApiDataToClient(rawpatient, patientMapping)
  //   );
  //   return patients;
  // }
  return demoPatients;
};

export const getPatients = async (organizationId) => {
  // if (isLocalHost) {
  //   const url = `${ROOT_URL}/test_registrations`;
  //   const response = await axios.get(url);
  //   const rawpatients = response.data.items;
  //   const patients = rawpatients.map((rawpatient) =>
  //     mapApiDataToClient(rawpatient, patientMapping)
  //   );
  //   return patients;
  // }
  return demoPatients;
};
