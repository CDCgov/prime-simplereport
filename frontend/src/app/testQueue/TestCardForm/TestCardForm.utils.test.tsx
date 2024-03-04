import mockSupportedDiseaseCovid from "../mocks/mockSupportedDiseaseCovid";
import mockSupportedDiseaseMultiplex, {
  mockSupportedDiseaseFlu,
} from "../mocks/mockSupportedDiseaseMultiplex";
import { TEST_RESULTS } from "../../testResults/constants";

import { TestFormState } from "./TestCardFormReducer";
import { AOEFormOption, areAOEAnswersComplete } from "./TestCardForm.utils";
import { QueriedFacility } from "./types";

const covidDeviceName = "LumiraDX";
const multiplexDeviceName = "Multiplex";
const multiplexAndCovidOnlyDeviceName = "MultiplexAndCovidOnly";
const fluDeviceName = "FLU";

const covidDeviceId = "COVID-DEVICE-ID";
const multiplexDeviceId = "MULTIPLEX-DEVICE-ID";
const multiplexAndCovidOnlyDeviceId = "MULTIPLEX-COVID-DEVICE-ID";
const fluDeviceId = "FLU-DEVICE-ID";

const specimen1Name = "Swab of internal nose";
const specimen1Id = "SPECIMEN-1-ID";
const specimen2Name = "Nasopharyngeal swab";
const specimen2Id = "SPECIMEN-2-ID";

describe("TestCardForm.utils", () => {
  const facilityInfo: QueriedFacility = {
    id: "f02cfff5-1921-4293-beff-e2a5d03e1fda",
    name: "Testing Site",
    deviceTypes: [
      {
        internalId: covidDeviceId,
        name: covidDeviceName,
        testLength: 15,
        supportedDiseaseTestPerformed: mockSupportedDiseaseCovid,
        swabTypes: [
          {
            name: specimen1Name,
            internalId: specimen1Id,
            typeCode: "445297001",
          },
          {
            name: specimen2Name,
            internalId: specimen2Id,
            typeCode: "258500001",
          },
        ],
      },
      {
        internalId: multiplexDeviceId,
        name: multiplexDeviceName,
        testLength: 15,
        supportedDiseaseTestPerformed: mockSupportedDiseaseMultiplex,
        swabTypes: [
          {
            name: specimen1Name,
            internalId: specimen1Id,
            typeCode: "445297001",
          },
          {
            name: specimen2Name,
            internalId: specimen2Id,
            typeCode: "258500001",
          },
        ],
      },
      {
        internalId: fluDeviceId,
        name: fluDeviceName,
        testLength: 15,
        supportedDiseaseTestPerformed: [...mockSupportedDiseaseFlu],
        swabTypes: [
          {
            name: specimen1Name,
            internalId: specimen1Id,
            typeCode: "445297001",
          },
          {
            name: specimen2Name,
            internalId: specimen2Id,
            typeCode: "258500001",
          },
        ],
      },
      {
        internalId: multiplexAndCovidOnlyDeviceId,
        name: multiplexAndCovidOnlyDeviceName,
        testLength: 15,
        supportedDiseaseTestPerformed: [
          ...mockSupportedDiseaseFlu,
          {
            supportedDisease: mockSupportedDiseaseCovid[0].supportedDisease,
            testPerformedLoincCode: "123456",
            testOrderedLoincCode: "445566",
          },
          {
            supportedDisease: mockSupportedDiseaseCovid[0].supportedDisease,
            testPerformedLoincCode: "123456",
            testOrderedLoincCode: "778899",
          },
        ],
        swabTypes: [
          {
            name: specimen1Name,
            internalId: specimen1Id,
            typeCode: "445297001",
          },
          {
            name: specimen2Name,
            internalId: specimen2Id,
            typeCode: "258500001",
          },
        ],
      },
    ],
  };

  const devicesMap = new Map();
  facilityInfo.deviceTypes.map((d) => devicesMap.set(d.internalId, d));

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
