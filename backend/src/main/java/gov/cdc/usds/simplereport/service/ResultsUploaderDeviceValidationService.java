package gov.cdc.usds.simplereport.service;

import static gov.cdc.usds.simplereport.config.CachingConfig.DEVICE_MODEL_AND_TEST_PERFORMED_CODE_MAP;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import gov.cdc.usds.simplereport.db.repository.SpecimenTypeRepository;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResultsUploaderDeviceValidationService {
  private final DeviceTypeRepository deviceTypeRepository;
  private final SpecimenTypeRepository specimenTypeRepository;

  private static final Map<String, String> specimenSNOMEDMap = new HashMap<>();

  static {
    specimenSNOMEDMap.put("Swab of internal nose", "445297001");
    specimenSNOMEDMap.put("Nasal Swab", "445297001");
    specimenSNOMEDMap.put("Nasal", "445297001");
    specimenSNOMEDMap.put("Varied", "445297001");
    specimenSNOMEDMap.put("Nasopharyngeal swab", "258500001");
    specimenSNOMEDMap.put("Mid-turbinate nasal swab", "871810001");
    specimenSNOMEDMap.put("Anterior nares swab", "697989009");
    specimenSNOMEDMap.put("Anterior nasal swab", "697989009");
    specimenSNOMEDMap.put("Nasopharyngeal aspirate", "258411007");
    specimenSNOMEDMap.put("Nasopharyngeal washings", "258467004");
    specimenSNOMEDMap.put("Nasopharyngeal wash", "258467004");
    specimenSNOMEDMap.put("Nasal aspirate", "429931000124105");
    specimenSNOMEDMap.put("Nasal aspirate specimen", "429931000124105");
    specimenSNOMEDMap.put("Throat swab", "258529004");
    specimenSNOMEDMap.put("Oropharyngeal swab", "258529004");
    specimenSNOMEDMap.put("Oral swab", "418932006");
    specimenSNOMEDMap.put("Sputum specimen", "119334006");
    specimenSNOMEDMap.put("Sputum", "119334006");
    specimenSNOMEDMap.put("Saliva specimen", "258560004");
    specimenSNOMEDMap.put("Saliva", "258560004");
    specimenSNOMEDMap.put("Serum specimen", "119364003");
    specimenSNOMEDMap.put("Serum", "119364003");
    specimenSNOMEDMap.put("Plasma specimen", "119361006");
    specimenSNOMEDMap.put("Plasma", "119361006");
    specimenSNOMEDMap.put("Whole blood sample", "258580003");
    specimenSNOMEDMap.put("Whole blood", "258580003");
    specimenSNOMEDMap.put("Venous blood specimen", "122555007");
    specimenSNOMEDMap.put("Venous whole blood", "122555007");
    specimenSNOMEDMap.put("Blood specimen", "119297000");
    specimenSNOMEDMap.put("Capillary blood specimen", "122554006");
    specimenSNOMEDMap.put("fingerstick whole blood", "122554006");
    specimenSNOMEDMap.put("Dried blood spot specimen", "440500007");
    specimenSNOMEDMap.put("Dried blood spot", "440500007");
    specimenSNOMEDMap.put("fingerstick blood dried blood spot", "440500007");
    specimenSNOMEDMap.put("Nasopharyngeal and oropharyngeal swab", "433801000124107");
    specimenSNOMEDMap.put("Nasal and throat swab combination", "433801000124107");
    specimenSNOMEDMap.put("Nasal and throat swab", "433801000124107");
    specimenSNOMEDMap.put("Lower respiratory fluid sample", "309171007");
    specimenSNOMEDMap.put("lower respiratory tract aspirates", "309171007");
    specimenSNOMEDMap.put("Bronchoalveolar lavage fluid sample", "258607008");
    specimenSNOMEDMap.put("Bronchoalveolar lavage fluid", "258607008");
    specimenSNOMEDMap.put("Bronchoalveolar lavage", "258607008");
  }

  @Cacheable(DEVICE_MODEL_AND_TEST_PERFORMED_CODE_MAP)
  public Map<String, DeviceType> getModelAndTestPerformedCodeToDeviceMap() {
    log.info("generating ModelAndTestPerformedCodeToDeviceMap cache");

    Map<String, DeviceType> resultMap = new HashMap<>();

    deviceTypeRepository
        .findAllRecords()
        .forEach(
            deviceType ->
                deviceType
                    .getSupportedDiseaseTestPerformed()
                    .forEach(
                        deviceTypeDisease -> {
                          String model = deviceType.getModel();
                          String testPerformedCode = deviceTypeDisease.getTestPerformedLoincCode();
                          if (model != null && testPerformedCode != null) {
                            resultMap.put(getMapKey(model, testPerformedCode), deviceType);
                          }
                        }));

    return resultMap;
  }

  @Scheduled(fixedRate = 1, timeUnit = TimeUnit.HOURS)
  @Caching(
      evict = {@CacheEvict(value = DEVICE_MODEL_AND_TEST_PERFORMED_CODE_MAP, allEntries = true)})
  public void cacheModelAndTestPerformedCodeToDeviceMap() {
    log.info("clear and generate ModelAndTestPerformedCodeToDeviceMap cache");
    getModelAndTestPerformedCodeToDeviceMap();
  }

  @Cacheable(DEVICE_MODEL_AND_TEST_PERFORMED_CODE_MAP)
  public Map<String, String> getSpecimenTypeNameToSNOMEDMap() {
    log.info("generating getSpecimenTypeNameToSNOMEDMap cache");

    var dbSpecimens =
        specimenTypeRepository.findAll().stream()
            .collect(Collectors.toMap(SpecimenType::getName, SpecimenType::getTypeCode));

    // Combine specimen name -> SNOMED maps from the database and those hardcoded in the service,
    // favoring the DB result on conflicts
    return Stream.of(dbSpecimens, specimenSNOMEDMap)
        .flatMap(map -> map.entrySet().stream())
        .collect(
            Collectors.toMap(
                o -> o.getKey().toLowerCase(), Map.Entry::getValue, (db, mem) -> db, HashMap::new));
  }

  @Scheduled(fixedRate = 1, timeUnit = TimeUnit.HOURS)
  @Caching(
      evict = {@CacheEvict(value = DEVICE_MODEL_AND_TEST_PERFORMED_CODE_MAP, allEntries = true)})
  public void cacheSpecimenTypeNameToSNOMEDMap() {
    log.info("clear and generate specimenTypeNameToSNOMEDMap cache");
    getSpecimenTypeNameToSNOMEDMap();
  }

  public static String getMapKey(String model, String testPerformedCode) {
    return model.toLowerCase() + "|" + testPerformedCode.toLowerCase();
  }
}
