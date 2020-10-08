import axios from "axios";
import { BASE_URL } from "../config/constants";
import { samplePatients } from "../app/test/data/patients";
import { COVID_RESULTS } from "../app/constants";
import { isLocalHost } from "../utils";
import { mapApiDataToClient } from "../utils/mappers";
import { testResultMapping } from "./mappings";

export const getTestResult = async (patientId) => {
  if (isLocalHost) {
    const url = `http://localhost:8000${BASE_URL}/test_results/${patientId}`;
    const response = await axios.get(url);
    const rawTestResult = response.data;
    const testResult = mapApiDataToClient(rawTestResult, testResultMapping);
    return testResult;
  }
  return {
    testResult: COVID_RESULTS.DETECTED,
    ...samplePatients.find(
      (samplepatient) => samplepatient.patientId === patientId
    ),
  };
};
