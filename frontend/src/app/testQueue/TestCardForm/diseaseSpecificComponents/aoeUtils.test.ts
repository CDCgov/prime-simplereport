import {
  chlamydiaSymptomDefinitions,
  chlamydiaSymptomOrder,
  gonorrheaSymptomDefinitions,
  gonorrheaSymptomOrder,
  hepatitisCSymptomDefinitions,
  hepatitisCSymptomOrder,
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
  it("takes a JSON payload of {'Hepatitis C symptom SNOMEDS' : boolean strings} and parses the strings into booleans", () => {
    const hepatitisCSymptomPayload =
      '{"225549006":false,"110292000":false,"249497008":false,"271681002":false,"386661006":false,"39575007":false,"271863002":false,"57676002":false,"224960004":false}\n';
    const parsedPayload = mapSymptomBoolLiteralsToBool(
      hepatitisCSymptomPayload,
      hepatitisCSymptomDefinitions
    );
    hepatitisCSymptomOrder.forEach((symptomKey) => {
      expect(parsedPayload[symptomKey]).toEqual(false);
    });
  });
  it("takes a JSON payload of {'Gonorrhea symptom SNOMEDS' : boolean strings} and parses the strings into booleans", () => {
    const gonorrheaSymptomPayload =
      '{"49650001":false,"289560001":false,"399131003":false,"249661007":false,"90446007":false,"71393004":false,"131148009":false,"225595004":false}\n';
    const parsedPayload = mapSymptomBoolLiteralsToBool(
      gonorrheaSymptomPayload,
      gonorrheaSymptomDefinitions
    );
    gonorrheaSymptomOrder.forEach((symptomKey) => {
      expect(parsedPayload[symptomKey]).toEqual(false);
    });
  });
  it("takes a JSON payload of {'Chlamydia symptom SNOMEDS' : boolean strings} and parses the strings into booleans", () => {
    const chlamydiaSymptomPayload =
      '{"77880009":false,"405729008":false,"301822002":false,"249301002":false,"49650001":false,"9957009":false,"162156001":false,"63901009":false,"438457000":false}\n';
    const parsedPayload = mapSymptomBoolLiteralsToBool(
      chlamydiaSymptomPayload,
      chlamydiaSymptomDefinitions
    );
    chlamydiaSymptomOrder.forEach((symptomKey) => {
      expect(parsedPayload[symptomKey]).toEqual(false);
    });
  });
});
