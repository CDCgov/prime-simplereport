package gov.cdc.usds.simplereport.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching
public class CachingConfig {

  public static final String COVID_EQUIPMENT_MODEL_AND_TEST_PERFORMED_CODE_SET =
      "covidEquipmentModelAndTestPerformedCodeSet";
  public static final String HEPATITIS_C_EQUIPMENT_MODEL_AND_TEST_PERFORMED_CODE_SET =
      "hepatitisCEquipmentModelAndTestPerformedCodeSet";
  public static final String HIV_EQUIPMENT_MODEL_AND_TEST_PERFORMED_CODE_SET =
      "hivEquipmentModelAndTestPerformedCodeSet";
  public static final String SYPHILIS_EQUIPMENT_MODEL_AND_TEST_PERFORMED_CODE_SET =
      "syphilisEquipmentModelAndTestPerformedCodeSet";
  public static final String DEVICE_MODEL_AND_TEST_PERFORMED_CODE_MAP =
      "deviceModelAndTestPerformedCodeMap";
  public static final String SPECIMEN_NAME_TO_SNOMED_MAP = "specimenTypeNameSNOMEDMap";
  public static final String SNOMED_TO_SPECIMEN_NAME_MAP = "SNOMEDToSpecimenTypeNameMap";
  public static final String ADDRESS_TIMEZONE_LOOKUP_MAP = "addressTimezoneLookupMap";
  public static final String SUPPORTED_DISEASE_ID_MAP = "supportedDiseaseIDMap";

  @Bean
  public CacheManager cacheManager() {
    return new ConcurrentMapCacheManager(
        COVID_EQUIPMENT_MODEL_AND_TEST_PERFORMED_CODE_SET,
        HEPATITIS_C_EQUIPMENT_MODEL_AND_TEST_PERFORMED_CODE_SET,
        HIV_EQUIPMENT_MODEL_AND_TEST_PERFORMED_CODE_SET,
        SYPHILIS_EQUIPMENT_MODEL_AND_TEST_PERFORMED_CODE_SET,
        DEVICE_MODEL_AND_TEST_PERFORMED_CODE_MAP,
        SPECIMEN_NAME_TO_SNOMED_MAP,
        SNOMED_TO_SPECIMEN_NAME_MAP,
        ADDRESS_TIMEZONE_LOOKUP_MAP,
        SUPPORTED_DISEASE_ID_MAP);
  }
}
