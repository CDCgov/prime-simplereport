package gov.cdc.usds.simplereport.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.api.model.CreateDeviceType;
import gov.cdc.usds.simplereport.api.model.CreateSpecimenType;
import gov.cdc.usds.simplereport.api.model.SupportedDiseaseTestPerformedInput;
import gov.cdc.usds.simplereport.config.FeatureFlagsConfig;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;

@SliceTestConfiguration.WithSimpleReportSiteAdminUser
class ResultsUploaderDeviceServiceTest extends BaseServiceTest<ResultsUploaderCachingService> {
  @Autowired private SpecimenTypeService specimenTypeService;
  @Autowired private DeviceTypeService deviceTypeService;
  @Autowired private DiseaseService diseaseService;
  @Autowired private ResultsUploaderDeviceService deviceService;
  @Autowired private ResultsUploaderCachingService cachingService;

  @Autowired @MockBean private FeatureFlagsConfig featureFlagsConfig;

  private final Random random = new Random();

  @Test
  void gettingDevice_success() {
    // GIVEN
    DeviceType expectedDevice =
        createDeviceType("Alinity M*", List.of("97088-0"), diseaseService.covid().getInternalId());

    // WHEN
    DeviceType deviceToVerify = deviceService.getDeviceFromCache("Alinity M*", "97088-0");

    // THEN
    assertThat(deviceToVerify).isEqualTo(expectedDevice);
  }

  @Test
  void validateModelAndTestPerformedCombination_success() {
    // GIVEN
    createDeviceType(
        "device to validate", List.of("97088-0"), diseaseService.covid().getInternalId());

    // WHEN
    boolean validationResult =
        deviceService.validateModelAndTestPerformedCombination("device to validate", "97088-0");

    // THEN
    assertThat(validationResult).isTrue();
  }

  @Test
  void validateModelAndTestPerformedCombination_correctlyReturnsFalseForBadDevices() {
    // WHEN
    boolean validationResult =
        deviceService.validateModelAndTestPerformedCombination(
            "device that shouldn't exist", "97088-0");

    // THEN
    assertThat(validationResult).isFalse();
  }

  @Test
  void validateOnlyIncludeActiveDiseases_returnsTrueForNonFeatureFlaggedDisease() {
    // GIVEN
    createDeviceType(
        "covid test device", List.of("97088-0"), diseaseService.covid().getInternalId());

    // WHEN
    boolean validationResult =
        deviceService.validateResultsOnlyIncludeActiveDiseases("covid test device", "97088-0");

    // THEN
    assertThat(validationResult).isTrue();
  }

  @Test
  void validateOnlyIncludeActiveDiseases_returnsFalseWhenHIVIsOff() {
    // GIVEN
    when(featureFlagsConfig.isHivBulkUploadEnabled()).thenReturn(false);
    createDeviceType("hiv device", List.of("97088-0"), diseaseService.hiv().getInternalId());

    // WHEN
    boolean validationResult =
        deviceService.validateResultsOnlyIncludeActiveDiseases("hiv device", "97088-0");

    // THEN
    assertThat(validationResult).isFalse();
  }

  @Test
  void validateOnlyIncludeActiveDiseases_returnsTrueWhenHIVIsOn() {
    // GIVEN
    when(featureFlagsConfig.isHivBulkUploadEnabled()).thenReturn(true);
    createDeviceType("hiv device", List.of("97088-0"), diseaseService.hiv().getInternalId());

    // WHEN
    boolean validationResult =
        deviceService.validateResultsOnlyIncludeActiveDiseases("hiv device", "97088-0");

    // THEN
    assertThat(validationResult).isTrue();
  }

  @Test
  void validateOnlyIncludeActiveDiseases_returnsFalseWhenChlamydiaIsOff() {
    // GIVEN
    when(featureFlagsConfig.isChlamydiaEnabled()).thenReturn(false);
    createDeviceType(
        "chlamydia device", List.of("6349-5"), diseaseService.chlamydia().getInternalId());

    // WHEN
    boolean validationResult =
        deviceService.validateResultsOnlyIncludeActiveDiseases("chlamydia device", "6349-5");

    // THEN
    assertThat(validationResult).isFalse();
  }

  @Test
  void validateOnlyIncludeActiveDiseases_returnsTrueWhenChlamydiaIsOn() {
    // GIVEN
    when(featureFlagsConfig.isChlamydiaEnabled()).thenReturn(true);
    createDeviceType(
        "chlamydia device", List.of("6349-5"), diseaseService.gonorrhea().getInternalId());

    // WHEN
    boolean validationResult =
        deviceService.validateResultsOnlyIncludeActiveDiseases("chlamydia device", "6349-5");

    // THEN
    assertThat(validationResult).isTrue();
  }

  @Test
  void validateOnlyIncludeActiveDiseases_returnsFalseWhenGonorrheaIsOff() {
    // GIVEN
    when(featureFlagsConfig.isGonorrheaEnabled()).thenReturn(false);
    createDeviceType(
        "gonorrhea device", List.of("8248-7"), diseaseService.gonorrhea().getInternalId());

    // WHEN
    boolean validationResult =
        deviceService.validateResultsOnlyIncludeActiveDiseases("gonorrhea device", "8248-7");

    // THEN
    assertThat(validationResult).isFalse();
  }

  @Test
  void validateOnlyIncludeActiveDiseases_returnsTrueWhenGonorrheaIsOn() {
    // GIVEN
    when(featureFlagsConfig.isGonorrheaEnabled()).thenReturn(true);
    createDeviceType(
        "gonorrhea device", List.of("8248-7"), diseaseService.gonorrhea().getInternalId());

    // WHEN
    boolean validationResult =
        deviceService.validateResultsOnlyIncludeActiveDiseases("gonorrhea device", "8248-7");

    // THEN
    assertThat(validationResult).isTrue();
  }

  @Test
  void validateOnlyIncludeActiveDiseases_returnsFalseWhenSyphilisIsOff() {
    // GIVEN
    when(featureFlagsConfig.isSyphilisEnabled()).thenReturn(false);
    createDeviceType(
        "syphilis device", List.of("5010-4"), diseaseService.syphilis().getInternalId());

    // WHEN
    boolean validationResult =
        deviceService.validateResultsOnlyIncludeActiveDiseases("syphilis device", "5010-4");

    // THEN
    assertThat(validationResult).isFalse();
  }

  @Test
  void validateOnlyIncludeActiveDiseases_returnsTrueWhenSyphilisIsOn() {
    // GIVEN
    when(featureFlagsConfig.isSyphilisEnabled()).thenReturn(true);
    createDeviceType(
        "syphilis device", List.of("7185-2"), diseaseService.syphilis().getInternalId());

    // WHEN
    boolean validationResult =
        deviceService.validateResultsOnlyIncludeActiveDiseases("syphilis device", "7185-2");

    // THEN
    assertThat(validationResult).isTrue();
  }

  @Test
  void validateOnlyIncludeActiveDiseases_returnsFalseWhenHepCIsOff() {
    // GIVEN
    when(featureFlagsConfig.isHepatitisCEnabled()).thenReturn(false);
    createDeviceType(
        "hepatitisC device", List.of("5010-4"), diseaseService.hepatitisC().getInternalId());

    // WHEN
    boolean validationResult =
        deviceService.validateResultsOnlyIncludeActiveDiseases("hepatitisC device", "5010-4");

    // THEN
    assertThat(validationResult).isFalse();
  }

  @Test
  void validateOnlyIncludeActiveDiseases_returnsTrueWhenHepCIsOn() {
    // GIVEN
    when(featureFlagsConfig.isHepatitisCEnabled()).thenReturn(true);
    createDeviceType(
        "hepatitisC device", List.of("5010-4"), diseaseService.hepatitisC().getInternalId());

    // WHEN
    boolean validationResult =
        deviceService.validateResultsOnlyIncludeActiveDiseases("hepatitisC device", "5010-4");

    // THEN
    assertThat(validationResult).isTrue();
  }

  private DeviceType createDeviceType(
      String model, List<String> testPerformedCodes, UUID diseaseUUID) {
    SpecimenType specimenType =
        specimenTypeService.createSpecimenType(
            CreateSpecimenType.builder()
                .name(UUID.randomUUID().toString())
                .typeCode(String.valueOf(100000 + random.nextInt(99999)))
                .collectionLocationName("Nasopharangyal Structure")
                .collectionLocationCode("123456789")
                .build());

    List<SupportedDiseaseTestPerformedInput> deviceTypeDiseases =
        new ArrayList<>(
            testPerformedCodes.stream()
                .map(
                    testPerformedCode ->
                        SupportedDiseaseTestPerformedInput.builder()
                            .supportedDisease(diseaseUUID)
                            .testPerformedLoincCode(testPerformedCode)
                            .equipmentUid(UUID.randomUUID().toString())
                            .testkitNameId(UUID.randomUUID().toString())
                            .testOrderedLoincCode(
                                new StringBuilder(testPerformedCode).reverse().toString())
                            .build())
                .toList());

    DeviceType createdDeviceType =
        deviceTypeService.createDeviceType(
            CreateDeviceType.builder()
                .name(UUID.randomUUID().toString())
                .model(model)
                .manufacturer(UUID.randomUUID().toString())
                .swabTypes(List.of(specimenType.getInternalId()))
                .supportedDiseaseTestPerformed(deviceTypeDiseases)
                .testLength(1)
                .build());

    // flush the cache after we make a new device
    cachingService.cacheModelAndTestPerformedCodeToDeviceMap();
    return createdDeviceType;
  }
}
