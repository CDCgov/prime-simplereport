import {
  respiratorySymptomDefinitions,
  respiratorySymptomOrder,
} from "../../../../patientApp/timeOfTest/constants";

import { mapSymptomBoolLiteralsToBool } from "./aoeUtils";

describe("mapSymptomBoolLiteralsToBool", () => {
  it("takes a JSON payload of {'Respiratory symptom SNOMEDS' : boolean strings} and parses the strings into booleans", () => {
    const covidSymptomPayload =
      '{"25064002":false,"36955009":false,"43724002":false,"44169009":false,"49727002":false,"62315008":false,"64531003":false,"68235000":false,"68962001":false,"84229001":false,"103001002":false,"162397003":false,"230145002":false,"267036007":false,"422400008":false,"422587007":false,"426000000":false}\n';
    const parsedPayload = mapSymptomBoolLiteralsToBool(
      covidSymptomPayload,
      respiratorySymptomDefinitions
    );
    respiratorySymptomOrder.forEach((symptomKey) => {
      expect(parsedPayload[symptomKey]).toEqual(false);
    });
  });
});
