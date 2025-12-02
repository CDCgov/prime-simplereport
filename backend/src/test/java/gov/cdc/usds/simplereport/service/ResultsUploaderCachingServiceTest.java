package gov.cdc.usds.simplereport.service;

import static gov.cdc.usds.simplereport.service.ResultsUploaderCachingService.getKey;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import gov.cdc.usds.simplereport.api.model.CreateDeviceType;
import gov.cdc.usds.simplereport.api.model.CreateSpecimenType;
import gov.cdc.usds.simplereport.api.model.SupportedDiseaseTestPerformedInput;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SliceTestConfiguration.WithSimpleReportSiteAdminUser
class ResultsUploaderCachingServiceTest extends BaseServiceTest<ResultsUploaderCachingService> {
  @MockitoBean private AddressValidationService addressValidationService;
  @Autowired private SpecimenTypeService specimenTypeService;
  @Autowired private DeviceTypeService deviceTypeService;
  @Autowired private DiseaseService diseaseService;
  @Autowired private ResultsUploaderCachingService sut;
  private final Random random = new Random();

  @Test
  void builds_deviceModel_testPerformedCode_map_test() {
    // GIVEN
    createDeviceType(
        "GenBody COVID-19 Ag", List.of("97097-0"), List.of("97000-0"), List.of("97000-1"));
    createDeviceType(
        "Alinity M", List.of("97088-0", "97022-0"), List.of("97011-0"), List.of("97022-1"));

    // WHEN
    Map<String, DeviceType> modelAndTestPerformedCodeToDeviceMap =
        sut.getModelAndTestPerformedCodeToDeviceMap();

    // THEN
    assertThat(modelAndTestPerformedCodeToDeviceMap.keySet())
        .hasSize(7)
        .contains("genbody covid-19 ag|97097-0")
        .contains("genbody covid-19 ag|97000-0")
        .contains("genbody covid-19 ag|97000-1")
        .contains("alinity m|97088-0")
        .contains("alinity m|97022-0")
        .contains("alinity m|97011-0")
        .contains("alinity m|97022-1")
        .contains(getKey("Alinity M", "97088-0"))
        .contains(getKey("GenBody COVID-19 Ag", "97097-0"));
  }

  @Test
  void builds_covid_only_deviceModel_testPerformedCode_set_test() {
    // GIVEN
    createDeviceType(
        "GenBody COVID-19 Ag", List.of("97097-0"), List.of("97000-0"), List.of("97000-1"));
    createDeviceType(
        "Alinity M", List.of("97088-0", "97022-0"), List.of("97011-0"), List.of("97022-1"));

    // WHEN
    Set<String> covidEquipmentModelAndTestPerformedCodeSet =
        sut.getCovidEquipmentModelAndTestPerformedCodeSet();

    // THEN
    assertThat(covidEquipmentModelAndTestPerformedCodeSet)
        .hasSize(3)
        .contains("genbody covid-19 ag|97097-0")
        .contains("alinity m|97088-0")
        .contains("alinity m|97022-0")
        .contains(getKey("Alinity M", "97088-0"))
        .contains(getKey("GenBody COVID-19 Ag", "97097-0"));
  }

  @Test
  void addressValidation_cachesIdenticalAddresses() {
    var address = new StreetAddress("123 Main St", null, "Buffalo", "New York", "14202", "Erie");
    sut.getZoneIdByAddress(address);
    sut.getZoneIdByAddress(address);
    sut.getZoneIdByAddress(address);
    verify(addressValidationService, times(1)).getZoneIdByAddress(any());
  }

  protected void createDeviceType(
      String model,
      List<String> covidTestPerformedCodes,
      List<String> fluATestOPerformedCodes,
      List<String> fluBTestOPerformedCodes) {
    SpecimenType specimenType =
        specimenTypeService.createSpecimenType(
            CreateSpecimenType.builder()
                .name(UUID.randomUUID().toString())
                .typeCode(String.valueOf(100000 + random.nextInt(99999)))
                .collectionLocationName("Nasopharangyal Structure")
                .collectionLocationCode("123456789")
                .build());

    List<SupportedDiseaseTestPerformedInput> deviceTypeDiseases = new ArrayList<>();

    deviceTypeDiseases.addAll(
        covidTestPerformedCodes.stream()
            .map(
                testPerformedCode ->
                    SupportedDiseaseTestPerformedInput.builder()
                        .supportedDisease(diseaseService.covid().getInternalId())
                        .testPerformedLoincCode(testPerformedCode)
                        .equipmentUid(UUID.randomUUID().toString())
                        .testkitNameId(UUID.randomUUID().toString())
                        .testOrderedLoincCode(
                            new StringBuilder(testPerformedCode).reverse().toString())
                        .build())
            .toList());

    deviceTypeDiseases.addAll(
        fluATestOPerformedCodes.stream()
            .map(
                testPerformedCode ->
                    SupportedDiseaseTestPerformedInput.builder()
                        .supportedDisease(diseaseService.fluA().getInternalId())
                        .testPerformedLoincCode(testPerformedCode)
                        .equipmentUid(UUID.randomUUID().toString())
                        .testkitNameId(UUID.randomUUID().toString())
                        .testOrderedLoincCode(
                            new StringBuilder(testPerformedCode).reverse().toString())
                        .build())
            .toList());

    deviceTypeDiseases.addAll(
        fluBTestOPerformedCodes.stream()
            .map(
                testPerformedCode ->
                    SupportedDiseaseTestPerformedInput.builder()
                        .supportedDisease(diseaseService.fluB().getInternalId())
                        .testPerformedLoincCode(testPerformedCode)
                        .equipmentUid(UUID.randomUUID().toString())
                        .testkitNameId(UUID.randomUUID().toString())
                        .testOrderedLoincCode(
                            new StringBuilder(testPerformedCode).reverse().toString())
                        .build())
            .toList());

    deviceTypeService.createDeviceType(
        CreateDeviceType.builder()
            .name(UUID.randomUUID().toString())
            .model(model)
            .manufacturer(UUID.randomUUID().toString())
            .swabTypes(List.of(specimenType.getInternalId()))
            .supportedDiseaseTestPerformed(deviceTypeDiseases)
            .testLength(1)
            .build());
  }
}
