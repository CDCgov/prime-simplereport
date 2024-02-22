package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.config.FeatureFlagsConfig;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.DeviceTypeDisease;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import java.util.List;
import java.util.Map;
import java.util.Objects;
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

  private static String removeTrailingAsterisk(String value) {
    if (value != null && !value.isEmpty() && value.charAt(value.length() - 1) == '*') {
      return value.substring(0, value.length() - 1);
    }
    return value;
  }

  private static String addTrailingAsterisk(String value) {
    if (value != null && !value.isEmpty() && value.charAt(value.length() - 1) != '*') {
      return value + "*";
    }
    return value;
  }

  public DeviceType getDeviceFromCache(String model, String testPerformedCode) {
    // often our devices have a trailing asterisk in the model name, which users often leave out and
    // generate support burden. In those cases, try both and return the non-null value.

    Map<String, DeviceType> referenceList =
        resultsUploaderCachingService.getModelAndTestPerformedCodeToDeviceMap();
    String keyToCheckWithAsterisk =
        ResultsUploaderCachingService.getKey(addTrailingAsterisk(model), testPerformedCode);

    String keyToCheckWithoutAsterisk =
        ResultsUploaderCachingService.getKey(removeTrailingAsterisk(model), testPerformedCode);

    return Objects.requireNonNullElse(
        referenceList.get(keyToCheckWithAsterisk), referenceList.get(keyToCheckWithoutAsterisk));
  }

  public boolean validateModelAndTestPerformedCombination(
      String equipmentModelName, String testPerformedCode) {
    Map<String, DeviceType> cachedResultsMap =
        resultsUploaderCachingService.getModelAndTestPerformedCodeToDeviceMap();

    boolean combinationKeyExistsWithoutAsterisk =
        cachedResultsMap.containsKey(
            ResultsUploaderCachingService.getKey(
                removeTrailingAsterisk(equipmentModelName), testPerformedCode));

    boolean combinationKeyExistsWithAsterisk =
        cachedResultsMap.containsKey(
            ResultsUploaderCachingService.getKey(equipmentModelName, testPerformedCode));

    return equipmentModelName != null
        && testPerformedCode != null
        // the || here is for a similar reason to getResultDevice: often our devices have a trailing
        // asterisk in the model name, which users often leave out and
        // generate support burden. In those cases, try both and return the non-null value.
        && (combinationKeyExistsWithoutAsterisk || combinationKeyExistsWithAsterisk);
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
