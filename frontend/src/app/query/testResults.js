// import axios from "axios";
// import { ROOT_URL } from "../../config/constants";
import { demoPatients } from "../fakeData/patients";
import { COVID_RESULTS } from "../constants";
// import { isLocalHost } from "../utils";
// import { mapApiDataToClient } from "../utils/mappers";
// import { testResultMapping } from "../testResults/mappings";

export const getTestResult = async (patientId) => {
  // if (isLocalHost) {
  //   const url = `${ROOT_URL}/test_results/${patientId}`;
  //   const response = await axios.get(url);
  //   const rawTestResult = response.data;
  //   const testResult = mapApiDataToClient(rawTestResult, testResultMapping);
  //   return testResult;
  // }
  const testResult = {
    testResult: COVID_RESULTS.DETECTED,
    ...demoPatients.find(
      (samplePatient) => samplePatient.patientId === patientId
    ),
  };
  console.log("testResult:", testResult);
  return testResult;
};
