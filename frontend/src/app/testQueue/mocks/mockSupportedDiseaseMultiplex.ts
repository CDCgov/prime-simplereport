import mockSupportedDiseaseTestPerformedMultiplex from "../../supportAdmin/DeviceType/mocks/mockSupportedDiseaseTestPerformedMultiplex";

import mockSupportedDiseaseCovid from "./mockSupportedDiseaseCovid";

let mockSupportedDiseaseFlu = [
  {
    supportedDisease:
      mockSupportedDiseaseTestPerformedMultiplex[1].supportedDisease,
  },
  {
    supportedDisease:
      mockSupportedDiseaseTestPerformedMultiplex[2].supportedDisease,
  },
];

const mockSupportedDiseaseMultiplex = [
  ...mockSupportedDiseaseCovid,
  ...mockSupportedDiseaseFlu,
];

export default mockSupportedDiseaseMultiplex;
