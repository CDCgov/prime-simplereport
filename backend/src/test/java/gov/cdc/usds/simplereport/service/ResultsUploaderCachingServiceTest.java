package gov.cdc.usds.simplereport.service;

import static gov.cdc.usds.simplereport.service.ResultsUploaderCachingService.getMapKey;
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
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;

@SliceTestConfiguration.WithSimpleReportSiteAdminUser
class ResultsUploaderCachingServiceTest extends BaseServiceTest<ResultsUploaderCachingService> {
  @MockBean private AddressValidationService addressValidationService;
  @Autowired private SpecimenTypeService specimenTypeService;
  @Autowired private DeviceTypeService deviceTypeService;
  @Autowired private DiseaseService diseaseService;
  @Autowired private ResultsUploaderCachingService sut;
  private final Random random = new Random();

  @Test
  void builds_deviceModel_testPerformedCode_set_test() {
    // GIVEN
    createDeviceType("GenBody COVID-19 Ag", "97097-0");
    createDeviceType("Alinity M", "97088-0", "97022-0");

    // WHEN
    Map<String, DeviceType> modelAndTestPerformedCodeToDeviceMap =
        sut.getModelAndTestPerformedCodeToDeviceMap();

    // THEN
    assertThat(modelAndTestPerformedCodeToDeviceMap.keySet())
        .hasSize(3)
        .contains("genbody covid-19 ag|97097-0")
        .contains("alinity m|97088-0")
        .contains("alinity m|97022-0")
        .contains(getMapKey("Alinity M", "97088-0"))
        .contains(getMapKey("GenBody COVID-19 Ag", "97097-0"));
  }

  @Test
  void addressValidation_cachesIdenticalAddresses() {
    var address = new StreetAddress("123 Main St", null, "Buffalo", "New York", "14202", "Erie");
    sut.getZoneIdByAddress(address);
    sut.getZoneIdByAddress(address);
    sut.getZoneIdByAddress(address);
    verify(addressValidationService, times(1)).getZoneIdByAddress(any());
  }

  @Test
  void addressValidation_checksUniqueAddresses() {
    sut.getZoneIdByAddress(
        new StreetAddress("123 Main St", null, "Buffalo", "New York", "14202", "Erie"));
    sut.getZoneIdByAddress(
        new StreetAddress("124 Main St", null, "Buffalo", "New York", "14220", "Erie"));
    sut.getZoneIdByAddress(
        new StreetAddress("125 Main St", null, "Buffalo", "New York", "14206", "Erie"));
    verify(addressValidationService, times(3)).getZoneIdByAddress(any());
  }

  protected void createDeviceType(String model, String... testPerformedCodes) {
    SpecimenType specimenType =
        specimenTypeService.createSpecimenType(
            CreateSpecimenType.builder()
                .name(UUID.randomUUID().toString())
                .typeCode(String.valueOf(100000 + random.nextInt(99999)))
                .collectionLocationName("Nasopharangyal Structure")
                .collectionLocationCode("123456789")
                .build());

    List<SupportedDiseaseTestPerformedInput> deviceTypeDiseases =
        Arrays.stream(testPerformedCodes)
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
            .collect(Collectors.toList());

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
