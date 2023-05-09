package gov.cdc.usds.simplereport.service;

import static gov.cdc.usds.simplereport.service.ResultsUploaderDeviceValidationService.getSetKey;
import static org.assertj.core.api.Assertions.assertThat;

import gov.cdc.usds.simplereport.api.model.CreateDeviceType;
import gov.cdc.usds.simplereport.api.model.CreateSpecimenType;
import gov.cdc.usds.simplereport.api.model.SupportedDiseaseTestPerformedInput;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import java.util.Arrays;
import java.util.List;
import java.util.Random;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

@SliceTestConfiguration.WithSimpleReportSiteAdminUser
class ResultsUploaderDeviceValidationServiceTest
    extends BaseServiceTest<ResultsUploaderDeviceValidationService> {
  @Autowired private SpecimenTypeService specimenTypeService;
  @Autowired private DeviceTypeService deviceTypeService;
  @Autowired private DiseaseService diseaseService;
  @Autowired private ResultsUploaderDeviceValidationService sut;
  private final Random random = new Random();

  @Test
  void builds_deviceModel_testPerformedCode_set_test() {
    // GIVEN
    createDeviceType("GenBody COVID-19 Ag", "97097-0");
    createDeviceType("Alinity M", "97088-0", "97022-0");

    // WHEN
    Set<String> modelAndTestPerformedCodeSet = sut.getModelAndTestPerformedCodeSet();

    // THEN
    assertThat(modelAndTestPerformedCodeSet)
        .hasSize(3)
        .contains("genbody covid-19 ag|97097-0")
        .contains("alinity m|97088-0")
        .contains("alinity m|97022-0")
        .contains(getSetKey("Alinity M", "97088-0"))
        .contains(getSetKey("GenBody COVID-19 Ag", "97097-0"));
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
