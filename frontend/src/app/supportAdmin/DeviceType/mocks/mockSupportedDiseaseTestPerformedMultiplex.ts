import mockSupportedDiseaseTestPerformedCovid from "./mockSupportedDiseaseTestPerformedCovid";
import mockSupportedDiseaseTestPerformedFlu from "./mockSupportedDiseaseTestPerformedFlu";

const mockSupportedDiseaseTestPerformedMultiplex = [
  ...mockSupportedDiseaseTestPerformedCovid,
  ...mockSupportedDiseaseTestPerformedFlu,
];

export default mockSupportedDiseaseTestPerformedMultiplex;
