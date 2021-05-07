import { symptomsStringToArray } from "./symptoms";

describe("symtomsStringToArray", () => {
  it("translates a string with zero symptoms to an array", () => {
    const symptomString =
      '{"64531003":"false","103001002":"false","84229001":"false","68235000":"false","426000000":"false","49727002":"false","68962001":"false","422587007":"false","267036007":"false","62315008":"false","43724002":"false","36955009":"false","44169009":"false","422400008":"false","230145002":"false","25064002":"false","162397003":"false"}';
    expect(symptomsStringToArray(symptomString)).toEqual([]);
  });
  it("translates a string with one symptom to an array", () => {
    const symptomString =
      '{"64531003":"false","103001002":"false","84229001":"false","68235000":"false","426000000":"true","49727002":"false","68962001":"false","422587007":"false","267036007":"false","62315008":"false","43724002":"false","36955009":"false","44169009":"false","422400008":"false","230145002":"false","25064002":"false","162397003":"false"}';
    expect(symptomsStringToArray(symptomString)).toEqual(["Fever over 100.4F"]);
  });
  it("translates a string with multiple symptoms to an array", () => {
    const symptomString =
      '{"64531003":"false","103001002":"false","84229001":"true","68235000":"false","426000000":"true","49727002":"false","68962001":"false","422587007":"false","267036007":"false","62315008":"false","43724002":"true","36955009":"false","44169009":"false","422400008":"false","230145002":"false","25064002":"true","162397003":"false"}';
    expect(symptomsStringToArray(symptomString)).toEqual([
      "Headache",
      "Chills",
      "Fatigue",
      "Fever over 100.4F",
    ]);
  });
});
