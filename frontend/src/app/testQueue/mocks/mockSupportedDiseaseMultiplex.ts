import mockSupportedDiseaseTestPerformedMultiplex from "../../supportAdmin/DeviceType/mocks/mockSupportedDiseaseTestPerformedMultiplex";

import mockSupportedDiseaseCovid from "./mockSupportedDiseaseCovid";

export const mockSupportedDiseaseFlu = [
  {
    supportedDisease:
      mockSupportedDiseaseTestPerformedMultiplex[1].supportedDisease,
    testPerformedLoincCode: "456789",
  },
  {
    supportedDisease:
      mockSupportedDiseaseTestPerformedMultiplex[2].supportedDisease,
    testPerformedLoincCode: "789123",
  },
];

const mockSupportedDiseaseMultiplex = [
  ...mockSupportedDiseaseCovid,
  ...mockSupportedDiseaseFlu,
];

export default mockSupportedDiseaseMultiplex;
