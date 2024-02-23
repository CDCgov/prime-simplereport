package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.config.FeatureFlagsConfig;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.DeviceTypeDisease;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

// Util class to extend ResultsUploaderCachingService that
// take advantage of the @Cacheable methods in that class, since @Cacheable's won't
// be used if called in the same class, as well as to centralize some checking logic
// for the cached device map.
@Component
public class ResultsUploaderDeviceService {
  private final ResultsUploaderCachingService resultsUploaderCachingService;
  private final FeatureFlagsConfig featureFlagsConfig;

  public ResultsUploaderDeviceService(
      ResultsUploaderCachingService resultsUploaderCachingService,
      FeatureFlagsConfig featureFlagsConfig) {
    this.resultsUploaderCachingService = resultsUploaderCachingService;
    this.featureFlagsConfig = featureFlagsConfig;
  }

  public DeviceType getDeviceFromCache(String model, String testPerformedCode) {
    return resultsUploaderCachingService
        .getModelAndTestPerformedCodeToDeviceMap()
        .get(ResultsUploaderCachingService.getKey(model, testPerformedCode));
  }

  public boolean validateModelAndTestPerformedCombination(
      String equipmentModelName, String testPerformedCode) {
    Map<String, DeviceType> cachedResultsMap =
        resultsUploaderCachingService.getModelAndTestPerformedCodeToDeviceMap();

    return equipmentModelName != null
        && testPerformedCode != null
        && cachedResultsMap.containsKey(
            ResultsUploaderCachingService.getKey(equipmentModelName, testPerformedCode));
  }

  public boolean validateResultsOnlyIncludeActiveDiseases(
      String equipmentModelName, String testPerformedCode) {
    if (equipmentModelName == null || testPerformedCode == null) {
      return false;
    }

    DeviceType deviceTypeToCheck = getDeviceFromCache(equipmentModelName, testPerformedCode);

    List<String> supportedDiseaseNamesToCheck =
        deviceTypeToCheck.getSupportedDiseaseTestPerformed().stream()
            .filter(sdtp -> sdtp.getTestPerformedLoincCode().equals(testPerformedCode))
            .map(DeviceTypeDisease::getSupportedDisease)
            .map(SupportedDisease::getName)
            .toList();

    if (supportedDiseaseNamesToCheck.contains("HIV")) {
      return featureFlagsConfig.isHivBulkUploadEnabled();
    }
    return true;
  }
}
