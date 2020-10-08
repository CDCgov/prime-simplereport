import axios from "axios";

import { ROOT_URL } from "../../config/constants";
import { samplePatients } from "../test/data/patients";
import { isLocalHost } from "../utils";
import { mapApiDataToClient } from "../utils/mappers";
import { patientMapping } from "./mappings";

export const getPatients = async (organizationId) => {
  if (isLocalHost) {
    const url = `${ROOT_URL}/test_registrations`;
    const response = await axios.get(url);
    const rawpatients = response.data.items;
    const patients = rawpatients.map((rawpatient) =>
      mapApiDataToClient(rawpatient, patientMapping)
    );
    return patients;
  }
  return samplePatients;
};
