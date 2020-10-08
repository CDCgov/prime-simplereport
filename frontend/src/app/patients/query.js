import axios from "axios";

import { BASE_URL } from "../../config/constants";
import { samplePatients } from "../test/data/patients";
import { isLocalHost } from "../../utils";
import { mapApiDataToClient } from "../../utils/mappers";
import { patientMapping } from "../../query/mappings";

export const getPatients = async (organizationId) => {
  if (isLocalHost) {
    const url = `http://localhost:8000${BASE_URL}/test_registrations`;
    const response = await axios.get(url);
    const rawpatients = response.data.items;
    const patients = rawpatients.map((rawpatient) =>
      mapApiDataToClient(rawpatient, patientMapping)
    );
    return patients;
  }
  return samplePatients;
};
