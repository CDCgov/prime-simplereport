import {
  alphabetizeSymptomKeysFromMapValues,
  OTHER_SYMPTOM_NOT_LISTED_LITERAL,
} from "./constants";

describe("utils", () => {
  it("alphabetizeSymptomKeysFromMapValues produces an alphabetized list of keys based on values when given a map", () => {
    const testSymptomMap = {
      "724386005": "b",
      "195469007": "a",
      "26284000": "c",
      "266128007": "f",
      "56940005": "g",
      "91554004": "e",
      "15188001": "z",
      "246636008": "y",
      "100000000": OTHER_SYMPTOM_NOT_LISTED_LITERAL,
    } as const;
    const symptomOrder = alphabetizeSymptomKeysFromMapValues(testSymptomMap);

    expect(symptomOrder).toEqual([
      "195469007",
      "724386005",
      "26284000",
      "91554004",
      "266128007",
      "56940005",
      "246636008",
      "15188001",
      // OTHER_SYMPTOM_NOT_LISTED_LITERAL should come last
      "100000000",
    ]);
  });
});
