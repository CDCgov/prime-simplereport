package gov.cdc.usds.simplereport.service;

import static graphql.Assert.assertNotNull;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.params.provider.Arguments.arguments;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.api.model.CreateDeviceType;
import gov.cdc.usds.simplereport.api.model.SupportedDiseaseTestPerformedInput;
import gov.cdc.usds.simplereport.api.model.errors.DryRunException;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.DeviceTypeDisease;
import gov.cdc.usds.simplereport.db.model.DeviceTypeSpecimenTypeMapping;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.repository.DeviceSpecimenTypeNewRepository;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeDiseaseRepository;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import gov.cdc.usds.simplereport.db.repository.SpecimenTypeRepository;
import gov.cdc.usds.simplereport.service.model.reportstream.LIVDResponse;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.TestPropertySource;

@TestPropertySource(properties = {"spring.jpa.properties.hibernate.enable_lazy_load_no_trans=true"})
class DeviceTypeLIVDSyncServiceIntegrationTest extends BaseServiceTest<DeviceTypeLIVDSyncService> {
  @Autowired private DeviceTypeService deviceTypeService;
  @Autowired private DeviceTypeRepository deviceTypeRepo;
  @Autowired private SpecimenTypeRepository specimenTypeRepository;
  @Autowired private DeviceSpecimenTypeNewRepository deviceSpecimenTypeRepository;
  @Autowired private DeviceTypeDiseaseRepository deviceTypeDiseaseRepository;

  @MockBean private DataHubClient dataHubClient;

  private SpecimenType swab1;
  private SpecimenType swab2;
  private SpecimenType swab3;
  private DeviceType devA;
  private DeviceType devB;
  private final String specimenDescriptionOne =
      "anterior nasal swabs (697989009^Anterior nares swab^SCT)\r";
  private final String specimenDescriptionTwo =
      "nasopharyngeal swabs (258500001^Nasopharyngeal swab^SCT)\r";
  private final String specimenDescriptionThree = "to be added (999999999^To Be Added^SCT)\r";

  @BeforeEach
  void setup() {
    swab1 = specimenTypeRepository.save(new SpecimenType("Anterior nares swab", "697989009"));
    swab2 = specimenTypeRepository.save(new SpecimenType("Nasopharyngeal swab", "258500001"));
    swab3 = specimenTypeRepository.save(new SpecimenType("A fake specimen type", "000000000"));
    SupportedDisease disease = _diseaseService.covid();

    // WHEN
    devA =
        // this device will have a specimen type added
        deviceTypeService.createDeviceType(
            CreateDeviceType.builder()
                .name("Device A")
                .model("Model A")
                .manufacturer("Manufacturer A")
                .swabTypes(List.of(swab1.getInternalId()))
                .supportedDiseaseTestPerformed(
                    List.of(
                        SupportedDiseaseTestPerformedInput.builder()
                            .supportedDisease(disease.getInternalId())
                            .testPerformedLoincCode("000000000")
                            .testPerformedLoincLongName("000000000 plus some extra stuff")
                            .testOrderedLoincCode("000000000")
                            .testOrderedLoincLongName("000000000 plus some extra stuff")
                            .equipmentUid("Equipment Uid")
                            .equipmentUidType("Equipment Uid Type")
                            .testkitNameId("TestKit Uid")
                            .build()))
                .testLength(1)
                .build());
    devB =
        // this device will have an extra specimen type not included
        // in the LIVD table
        deviceTypeService.createDeviceType(
            CreateDeviceType.builder()
                .name("Device B")
                .model("Model B")
                .manufacturer("Manufacturer B")
                .swabTypes(List.of(swab3.getInternalId()))
                .supportedDiseaseTestPerformed(
                    List.of(
                        SupportedDiseaseTestPerformedInput.builder()
                            .supportedDisease(disease.getInternalId())
                            .testPerformedLoincCode("258500001")
                            .testPerformedLoincLongName("258500001 plus some extra stuff")
                            .testOrderedLoincCode("253520011")
                            .testOrderedLoincLongName("253520011 plus some extra stuff")
                            .equipmentUid("Equipment Uid")
                            .equipmentUidType("Equipment Uid Type")
                            .testkitNameId("TestKit Uid")
                            .build()))
                .testLength(2)
                .build());
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportSiteAdminUser
  void syncDevices_updatesDevices() {
    LIVDResponse newDevice =
        LIVDResponse.builder()
            .manufacturer("Manufacturer A")
            .model("Model A")
            .vendorSpecimenDescription(List.of(specimenDescriptionOne))
            .vendorAnalyteName("influenza A RNA Result")
            .testPerformedLoincCode("7777777")
            .testPerformedLoincLongName("7777777 plus some extra stuff")
            .testOrderedLoincCode("8888888")
            .testOrderedLoincLongName("8888888 plus some extra stuff")
            .testKitNameId("Updated TestKit")
            .equipmentUid("Updated Equip")
            .equipmentUidType("Updated Equip Type")
            .build();

    List<LIVDResponse> devices = List.of(newDevice);

    when(dataHubClient.getLIVDTable()).thenReturn(devices);
    _service.syncDevices(false);
    var updatedDevice =
        deviceTypeRepo.findDeviceTypeByManufacturerAndModelAndIsDeletedFalse(
            newDevice.getManufacturer(), newDevice.getModel());
    assertTrue(updatedDevice.isPresent());

    // Device names are not altered by update operations
    assertThat(updatedDevice.get().getName()).isEqualTo("Device A");
    var codes = updatedDevice.get().getSupportedDiseaseTestPerformed();

    assertThat(codes).hasSize(1);
    var code = codes.get(0);
    assertThat(code.getTestkitNameId()).isEqualTo("Updated TestKit");
    assertThat(code.getEquipmentUid()).isEqualTo("Updated Equip");
    assertThat(code.getEquipmentUidType()).isEqualTo("Updated Equip Type");
    assertThat(code.getTestOrderedLoincLongName()).isEqualTo("8888888 plus some extra stuff");
    assertThat(code.getTestPerformedLoincLongName()).isEqualTo("7777777 plus some extra stuff");
  }

  @ParameterizedTest
  @MethodSource("deviceArgs")
  @SliceTestConfiguration.WithSimpleReportSiteAdminUser
  void syncDevices_createsDevices(String vendorAnalyteName, String expectedDiseaseName) {
    LIVDResponse newDevice =
        LIVDResponse.builder()
            .manufacturer("New Device Manufacturer")
            .model("New Device Model")
            .vendorSpecimenDescription(List.of(specimenDescriptionOne))
            .vendorAnalyteName(vendorAnalyteName)
            .testPerformedLoincCode("8888888")
            .testPerformedLoincLongName("8888888 plus some extra stuff")
            .testOrderedLoincCode("0123456")
            .testOrderedLoincLongName("0123456 plus some extra stuff")
            .testKitNameId("New TestKit")
            .equipmentUid("New Equip")
            .equipmentUidType("New Equip Uid Type")
            .build();
    List<LIVDResponse> devices = List.of(newDevice);

    when(dataHubClient.getLIVDTable()).thenReturn(devices);
    _service.syncDevices(false);
    var createdDevice =
        deviceTypeRepo.findDeviceTypeByManufacturerAndModelAndIsDeletedFalse(
            newDevice.getManufacturer(), newDevice.getModel());
    assertTrue(createdDevice.isPresent());
    assertThat(createdDevice.get().getManufacturer()).isEqualTo("New Device Manufacturer");
    assertThat(createdDevice.get().getModel()).isEqualTo("New Device Model");
    var supportedDiseaseTestPerformed = createdDevice.get().getSupportedDiseaseTestPerformed();
    assertThat(supportedDiseaseTestPerformed).hasSize(1);
    assertThat(supportedDiseaseTestPerformed.get(0).getSupportedDisease().getName())
        .isEqualTo(expectedDiseaseName);
  }

  private static Stream<Arguments> deviceArgs() {
    return Stream.of(
        arguments("influenza A RNA Result", "Flu A"),
        arguments("rsv", "RSV"),
        arguments("covid-19", "COVID-19"),
        arguments("flub", "Flu B"));
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportSiteAdminUser
  void syncDevices_updatesSpecimenTypes() {
    var deviceSpecimenTypes =
        deviceSpecimenTypeRepository.findAllByDeviceTypeId(devA.getInternalId());
    assertThat(deviceSpecimenTypes).hasSize(1);
    LIVDResponse deviceOne =
        LIVDResponse.builder()
            .manufacturer(devA.getManufacturer())
            .model(devA.getModel())
            .vendorSpecimenDescription(List.of(specimenDescriptionOne, specimenDescriptionTwo))
            .vendorAnalyteName("influenza A RNA Result")
            .testPerformedLoincCode("0123456")
            .testPerformedLoincLongName("0123456 plus some extra stuff")
            .testOrderedLoincCode("8888888")
            .testOrderedLoincLongName("8888888 plus some extra stuff")
            .testKitNameId("TestKit A")
            .equipmentUid("Equip A")
            .equipmentUidType("Equip A Type")
            .build();

    LIVDResponse deviceTwo =
        LIVDResponse.builder()
            .manufacturer(devB.getManufacturer())
            .model(devB.getModel())
            .vendorSpecimenDescription(List.of(specimenDescriptionOne, specimenDescriptionThree))
            .vendorAnalyteName("influenza A RNA Result")
            .testPerformedLoincCode("0123456")
            .testPerformedLoincLongName("0123456 plus some extra stuff")
            .testOrderedLoincCode("8888888")
            .testOrderedLoincLongName("8888888 plus some extra stuff")
            .testKitNameId("TestKit B")
            .equipmentUid("Equip B")
            .equipmentUidType("Equip B Type")
            .build();

    List<LIVDResponse> devices = List.of(deviceOne, deviceTwo);

    when(dataHubClient.getLIVDTable()).thenReturn(devices);

    _service.syncDevices(false);

    // Brand-new specimen type from response added to DB
    var newSpecimenType = specimenTypeRepository.findByTypeCodeAndIsDeletedFalse("999999999");
    assertTrue(newSpecimenType.isPresent());

    // Second specimen type from response was added to device
    var updatedDeviceSpecimenTypesA =
        deviceSpecimenTypeRepository.findAllByDeviceTypeId(devA.getInternalId());
    assertThat(updatedDeviceSpecimenTypesA).hasSize(2);
    assertThat(
            updatedDeviceSpecimenTypesA.stream()
                .map(DeviceTypeSpecimenTypeMapping::getSpecimenTypeId)
                .collect(Collectors.toList()))
        .containsOnly(swab1.getInternalId(), swab2.getInternalId());

    // Three device specimen types:
    //     - existed in database, added to device
    //     - did NOT exist in database, added to device
    //     - pre-existing specimen type for device not returned in response - not removed
    var updatedDeviceSpecimenTypesB =
        deviceSpecimenTypeRepository.findAllByDeviceTypeId(devB.getInternalId());
    assertThat(updatedDeviceSpecimenTypesB).hasSize(3);
    assertThat(
            updatedDeviceSpecimenTypesB.stream()
                .map(DeviceTypeSpecimenTypeMapping::getSpecimenTypeId)
                .collect(Collectors.toList()))
        .containsOnly(
            swab1.getInternalId(), swab3.getInternalId(), newSpecimenType.get().getInternalId());
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportSiteAdminUser
  void syncDevices_updatesAssociatedDeviceTypeDiseaseFields() {
    LIVDResponse newDevice =
        LIVDResponse.builder()
            .manufacturer("Manufacturer A")
            .model("Model A")
            .vendorSpecimenDescription(List.of(specimenDescriptionOne))
            .vendorAnalyteName("influenza A RNA Result")
            .testPerformedLoincCode("7777777")
            .testPerformedLoincLongName("7777777 plus some extra stuff")
            .testOrderedLoincCode("8888888")
            .testOrderedLoincLongName("8888888 plus some extra stuff")
            .testKitNameId("Updated TestKit")
            .equipmentUid("Updated Equip")
            .equipmentUidType("Updated Equip Type")
            .build();

    List<LIVDResponse> devices = List.of(newDevice);

    when(dataHubClient.getLIVDTable()).thenReturn(devices);
    _service.syncDevices(false);
    var updatedDevice =
        deviceTypeRepo.findDeviceTypeByManufacturerAndModelAndIsDeletedFalse(
            newDevice.getManufacturer(), newDevice.getModel());
    assertTrue(updatedDevice.isPresent());

    List<DeviceTypeDisease> deviceTypeDiseases =
        deviceTypeDiseaseRepository.findAllByDeviceTypeIdIn(
            Collections.singleton(updatedDevice.get().getInternalId()));
    assertThat(deviceTypeDiseases.get(0).getEquipmentUidType()).isEqualTo("Updated Equip Type");
    assertThat(deviceTypeDiseases.get(0).getEquipmentUid()).isEqualTo("Updated Equip");
    assertThat(deviceTypeDiseases.get(0).getTestkitNameId()).isEqualTo("Updated TestKit");
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportSiteAdminUser
  void syncDevices_skipsNullUpdates() {
    var existingDevice = deviceTypeRepo.findDeviceTypeByName(devA.getName());
    var updatedAt = existingDevice.getUpdatedAt();

    LIVDResponse device =
        LIVDResponse.builder()
            .manufacturer(existingDevice.getManufacturer())
            .model(existingDevice.getModel())
            .vendorSpecimenDescription(List.of(specimenDescriptionOne))
            .vendorAnalyteName("covid")
            .testPerformedLoincCode("000000000")
            .testPerformedLoincLongName("000000000 plus some extra stuff")
            .testOrderedLoincCode("000000000")
            .testOrderedLoincLongName("000000000 plus some extra stuff")
            .testKitNameId("TestKit Uid")
            .equipmentUid("Equipment Uid")
            .equipmentUidType("Equipment UID Type")
            .build();

    List<LIVDResponse> devices = List.of(device);

    when(dataHubClient.getLIVDTable()).thenReturn(devices);
    _service.syncDevices(false);
    var updatedDevice = deviceTypeRepo.findDeviceTypeByName(devA.getName());

    // Device was not updated
    assertEquals(updatedAt, updatedDevice.getUpdatedAt());
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportSiteAdminUser
  void syncDevices_skipsInvalidDiseases() {
    LIVDResponse device =
        LIVDResponse.builder()
            .manufacturer("Some manufacturer")
            .model("Some model")
            .vendorSpecimenDescription(List.of(specimenDescriptionOne))
            .vendorAnalyteName("invalid disease!")
            .testPerformedLoincCode("000000000")
            .testPerformedLoincLongName("000000000 plus some extra stuff")
            .testOrderedLoincCode("000000000")
            .testOrderedLoincLongName("000000000 plus some extra stuff")
            .testKitNameId("TestKit Uid")
            .equipmentUid("Equipment Uid")
            .equipmentUidType("Equipment UID Type")
            .build();

    List<LIVDResponse> devices = List.of(device);

    when(dataHubClient.getLIVDTable()).thenReturn(devices);
    assertDoesNotThrow(() -> _service.syncDevices(false));

    var createdDevice = deviceTypeRepo.findDeviceTypeByName("Some model");
    assertNull(createdDevice);
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportSiteAdminUser
  void syncDevices_avoidsDuplicateDeviceNames() {
    // Define a device with a `model` matching a different value and a new `manufacturer`
    LIVDResponse device =
        LIVDResponse.builder()
            .manufacturer("Shiny New Manufacturer")
            .model("Device A")
            .vendorSpecimenDescription(List.of(specimenDescriptionOne))
            .vendorAnalyteName("fluA")
            .testPerformedLoincCode("000000000")
            .testPerformedLoincLongName("000000000 plus some extra stuff")
            .testOrderedLoincCode("000000000")
            .testOrderedLoincLongName("000000000 plus some extra stuff")
            .testKitNameId("TestKit Uid")
            .equipmentUid("Equipment Uid")
            .equipmentUidType("Equipment UID Type")
            .build();

    List<LIVDResponse> devices = List.of(device);

    when(dataHubClient.getLIVDTable()).thenReturn(devices);
    _service.syncDevices(false);

    var createdDevice = deviceTypeRepo.findDeviceTypeByName("Shiny New Manufacturer Device A");
    assertNotNull(createdDevice);
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportSiteAdminUser
  void syncDevices_skipsConfiguredDevices() {
    LIVDResponse device =
        LIVDResponse.builder()
            .manufacturer("Applied BioCode, Inc.")
            .model("BioCode CoV-2 Flu Plus Assay")
            .vendorSpecimenDescription(List.of(specimenDescriptionOne))
            .vendorAnalyteName("fluA")
            .testPerformedLoincCode("000000000")
            .testPerformedLoincLongName("000000000 plus some extra stuff")
            .testOrderedLoincCode("000000000")
            .testOrderedLoincLongName("000000000 plus some extra stuff")
            .testKitNameId("TestKit Uid")
            .equipmentUid("Equipment Uid")
            .equipmentUidType("Equipment UID Type")
            .build();

    List<LIVDResponse> devices = List.of(device);

    when(dataHubClient.getLIVDTable()).thenReturn(devices);
    _service.syncDevices(false);

    var createdDevice = deviceTypeRepo.findDeviceTypeByName("BioCode CoV-2 Flu Plus Assay");
    assertNull(createdDevice);
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportSiteAdminUser
  void syncDevices_skipsForDryRuns() {
    LIVDResponse newDevice =
        LIVDResponse.builder()
            .manufacturer("Dry Run Device Manufacturer")
            .model("Dry Run Device Model")
            .vendorSpecimenDescription(List.of("not to be added (123456789^To Be Added^SCT)\n"))
            .vendorAnalyteName("OVID-19")
            .testPerformedLoincCode("8888888")
            .testPerformedLoincLongName("8888888 plus some extra stuff")
            .testOrderedLoincCode("0123456")
            .testOrderedLoincLongName("0123456 plus some extra stuff")
            .testKitNameId("Dry Run TestKit")
            .equipmentUid("Dry Run Equip")
            .equipmentUidType("Dry Run Equip Type")
            .build();

    List<LIVDResponse> devices = List.of(newDevice);

    when(dataHubClient.getLIVDTable()).thenReturn(devices);
    assertThrows(DryRunException.class, () -> _service.syncDevices(true));
    var createdDevice =
        deviceTypeRepo.findDeviceTypeByManufacturerAndModelAndIsDeletedFalse(
            newDevice.getManufacturer(), newDevice.getModel());
    var createdSpecimen = specimenTypeRepository.findByTypeCodeAndIsDeletedFalse("123456789");
    assertTrue(createdDevice.isEmpty());
    assertTrue(createdSpecimen.isEmpty());
  }
}
