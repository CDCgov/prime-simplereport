import { TestFormState } from "./TestCardFormReducer";
import { AOEFormOption, areAOEAnswersComplete } from "./TestCardForm.utils";
import { devicesMap } from "./testUtils/testConstants";

describe("TestCardForm.utils", () => {
  describe("areAOEAnswersComplete", () => {
    const incompleteState: TestFormState = {
      dateTested: "",
      deviceId: "",
      devicesMap: devicesMap,
      dirty: false,
      specimenId: "",
      testResults: [],
      aoeResponses: {
        pregnancy: undefined,
        noSymptoms: null,
        symptoms: null,
        symptomOnset: undefined,
        genderOfSexualPartners: null,
      },
    };

    const completeStateWithSymptoms: TestFormState = {
      ...incompleteState,
      aoeResponses: {
        pregnancy: "60001007",
        noSymptoms: false,
        symptoms:
          '{"25064002": true, "36955009": false, "43724002": false, "44169009": false, "49727002": false, "62315008": false, "64531003": false, "68235000": false, "68962001": false, "84229001": false, "103001002": false, "162397003": false, "230145002": false, "267036007": false, "422400008": false, "422587007": false, "426000000": false}',
        symptomOnset: "2023-11-13",
        genderOfSexualPartners: ["male"],
      },
    };

    it("should correctly evaluate whether COVID AOE answers are complete", () => {
      expect(
        areAOEAnswersComplete(incompleteState, AOEFormOption.COVID)
      ).toEqual(false);

      const completeStateNoSymptoms: TestFormState = {
        ...incompleteState,
        aoeResponses: {
          pregnancy: "60001007",
          noSymptoms: true,
          symptoms: null,
          symptomOnset: undefined,
          genderOfSexualPartners: null,
        },
      };

      expect(
        areAOEAnswersComplete(completeStateNoSymptoms, AOEFormOption.COVID)
      ).toEqual(true);

      const partialIncompleteState: TestFormState = {
        ...incompleteState,
        aoeResponses: {
          pregnancy: "60001007",
          noSymptoms: false,
          symptoms: null,
          symptomOnset: undefined,
          genderOfSexualPartners: null,
        },
      };

      expect(
        areAOEAnswersComplete(partialIncompleteState, AOEFormOption.COVID)
      ).toEqual(false);

      expect(
        areAOEAnswersComplete(completeStateWithSymptoms, AOEFormOption.COVID)
      ).toEqual(true);
    });

    it("should return true if HIV positive result is not selected", () => {
      const unknownResultState: TestFormState = {
        ...incompleteState,
      };
      expect(
        areAOEAnswersComplete(unknownResultState, AOEFormOption.HIV)
      ).toEqual(true);
    });

    it("should return false if HIV positive result is selected and questions are unanswered", () => {
      const positiveHIVState: TestFormState = {
        ...incompleteState,
        testResults: [
          { testResult: TEST_RESULTS.POSITIVE, diseaseName: "HIV" },
        ],
      };
      expect(
        areAOEAnswersComplete(positiveHIVState, AOEFormOption.HIV)
      ).toEqual(false);
    });

    it("should return true when HIV positive is selected and questions are answered", () => {
      const positiveHIVStateCompleteAOE: TestFormState = {
        ...completeStateWithSymptoms,
        testResults: [
          { testResult: TEST_RESULTS.POSITIVE, diseaseName: "HIV" },
        ],
      };
      expect(
        areAOEAnswersComplete(positiveHIVStateCompleteAOE, AOEFormOption.HIV)
      ).toEqual(true);
    });
  });
});
