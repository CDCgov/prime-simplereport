import { devicesMap } from "../testCardTestConstants";

import { TestFormState } from "./TestCardFormReducer";
import {
  AOEFormOption,
  AoeValidationErrorMessages,
  generateAoeValidationState,
} from "./TestCardForm.utils";

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
        generateAoeValidationState(incompleteState, AOEFormOption.COVID)
      ).toEqual(AoeValidationErrorMessages.INCOMPLETE);

      expect(
        generateAoeValidationState(
          completeStateWithSymptoms,
          AOEFormOption.COVID
        )
      ).toEqual(AoeValidationErrorMessages.COMPLETE);

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
        generateAoeValidationState(completeStateNoSymptoms, AOEFormOption.COVID)
      ).toEqual(AoeValidationErrorMessages.COMPLETE);

      const noSymptomsFalseButWithoutRequiredSymptomSubquestionsState: TestFormState =
        {
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
        generateAoeValidationState(
          noSymptomsFalseButWithoutRequiredSymptomSubquestionsState,
          AOEFormOption.COVID
        )
      ).toEqual(AoeValidationErrorMessages.SYMPTOM_VALIDATION_ERROR);

      const incompleteStateHasSymptomsButNoSymptomMap: TestFormState = {
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
        generateAoeValidationState(
          incompleteStateHasSymptomsButNoSymptomMap,
          AOEFormOption.COVID
        )
      ).toEqual(AoeValidationErrorMessages.SYMPTOM_VALIDATION_ERROR);
    });

    it("should return false if HIV questions are unanswered", () => {
      const positiveHIVState: TestFormState = {
        ...incompleteState,
      };
      expect(
        generateAoeValidationState(positiveHIVState, AOEFormOption.HIV)
      ).toEqual(AoeValidationErrorMessages.INCOMPLETE);
    });

    it("should return true when HIV positive is selected and questions are answered", () => {
      const positiveHIVStateCompleteAOE: TestFormState = {
        ...completeStateWithSymptoms,
      };
      expect(
        generateAoeValidationState(
          positiveHIVStateCompleteAOE,
          AOEFormOption.HIV
        )
      ).toEqual(AoeValidationErrorMessages.COMPLETE);
    });

    it("should return false if Gonorrhea questions are unanswered", () => {
      const positive: TestFormState = {
        ...incompleteState,
      };
      expect(
        generateAoeValidationState(positive, AOEFormOption.GONORRHEA)
      ).toEqual(AoeValidationErrorMessages.INCOMPLETE);
    });

    it("should return true when Gonorrhea positive is selected and questions are answered", () => {
      const positiveGonorrheaStateCompleteAOE: TestFormState = {
        ...completeStateWithSymptoms,
      };
      positiveGonorrheaStateCompleteAOE.aoeResponses.symptoms =
        '{"49650001":true,"289560001":false,"399131003":false,"249661007":false,"90446007":false,"71393004":false,"131148009":false,"225595004":false}';
      expect(
        generateAoeValidationState(
          positiveGonorrheaStateCompleteAOE,
          AOEFormOption.GONORRHEA
        )
      ).toEqual(AoeValidationErrorMessages.COMPLETE);
    });
  });
});
