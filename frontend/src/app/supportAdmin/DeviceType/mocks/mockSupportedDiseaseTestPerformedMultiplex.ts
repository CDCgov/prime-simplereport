import mockSupportedDiseaseTestPerformedCovid from "./mockSupportedDiseaseTestPerformedCovid";

let mockSupportedDiseaseTestPerformedFlu = [
  {
    supportedDisease: {
      internalId: "e286f2a8-38e2-445b-80a5-c16507a96b66",
      loinc: "LP14239-5",
      name: "Flu A",
    },
    testPerformedLoincCode: "LP14239-3",
    equipmentUid: "FluAEquipmentUid123",
    testkitNameId: "FluATestkitNameId123",
    testOrderedLoincCode: "LP14239-6",
  },
  {
    supportedDisease: {
      internalId: "14924488-268f-47db-bea6-aa706971a098",
      loinc: "LP14240-3",
      name: "Flu B",
    },
    testPerformedLoincCode: "LP14240-1",
    equipmentUid: "FluBEquipmentUid123",
    testkitNameId: "FluBTestkitNameId123",
    testOrderedLoincCode: "LP14240-5",
  },
];

const mockSupportedDiseaseTestPerformedMultiplex = [
  ...mockSupportedDiseaseTestPerformedCovid,
  ...mockSupportedDiseaseTestPerformedFlu,
];

export default mockSupportedDiseaseTestPerformedMultiplex;
