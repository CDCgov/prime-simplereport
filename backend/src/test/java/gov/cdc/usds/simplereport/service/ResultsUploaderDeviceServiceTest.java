package gov.cdc.usds.simplereport.service;

import static org.assertj.core.api.Assertions.assertThat;

import gov.cdc.usds.simplereport.api.model.CreateDeviceType;
import gov.cdc.usds.simplereport.api.model.CreateSpecimenType;
import gov.cdc.usds.simplereport.api.model.SupportedDiseaseTestPerformedInput;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

@SliceTestConfiguration.WithSimpleReportSiteAdminUser
class ResultsUploaderDeviceServiceTest extends BaseServiceTest<ResultsUploaderCachingService> {
  @Autowired private SpecimenTypeService specimenTypeService;
  @Autowired private DeviceTypeService deviceTypeService;
  @Autowired private DiseaseService diseaseService;
  @Autowired private ResultsUploaderCachingService sut;
  @Autowired private ResultsUploaderDeviceService deviceService;

  private final Random random = new Random();

  @Test
  void gettingDeviceWorksWithOrWithoutTrailingAsterisk() {
    // GIVEN
    DeviceType expectedDevice = createDeviceType("Alinity M*", List.of("97088-0"));

    // WHEN
    DeviceType receivedDeviceTypeWithAsterisk =
        deviceService.getDeviceFromCache("Alinity M*", "97088-0");

    DeviceType receivedDeviceTypeWithoutAsterisk =
        deviceService.getDeviceFromCache("Alinity M", "97088-0");

    // THEN
    assertThat(receivedDeviceTypeWithAsterisk).isEqualTo(expectedDevice);
    assertThat(receivedDeviceTypeWithoutAsterisk).isEqualTo(receivedDeviceTypeWithAsterisk);
  }

  private DeviceType createDeviceType(String model, List<String> testPerformedCodes) {
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
        testPerformedCodes.stream()
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

    return deviceTypeService.createDeviceType(
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
