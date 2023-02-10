package gov.cdc.usds.simplereport.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.api.model.CreateDeviceType;
import gov.cdc.usds.simplereport.db.model.DeviceSpecimenType;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.repository.DeviceSpecimenTypeRepository;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import gov.cdc.usds.simplereport.db.repository.SpecimenTypeRepository;
import gov.cdc.usds.simplereport.service.model.reportstream.LIVDResponse;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.util.List;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;

class DeviceTypeServiceIntegrationTest extends BaseServiceTest<DeviceTypeService> {
  @Autowired private DeviceTypeService deviceTypeService;
  @Autowired private DeviceTypeRepository deviceTypeRepo;
  @Autowired private SpecimenTypeRepository specimenTypeRepository;
  @Autowired private DeviceSpecimenTypeRepository deviceSpecimenTypeRepository;
  @MockBean private DataHubClient dataHubClient;

  private SpecimenType swab1;
  private SpecimenType swab2;
  private SpecimenType swab3;
  private DeviceType devA;
  private DeviceType devB;
  private String SPECIMEN_DESCRIPTION_ONE = "anterior nasal swabs (697989009^Anterior nares swab^SCT)\r";
  private String SPECIMEN_DESCRIPTION_TWO = "nasopharyngeal swabs (258500001^Nasopharyngeal swab^SCT)\r";
  private String SPECIMEN_DESCRIPTION_THREE = "to be added (999999999^To Be Added^SCT)\r";

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
                .loincCode("D")
                .swabTypes(List.of(swab1.getInternalId()))
                .supportedDiseases(List.of(disease.getInternalId()))
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
                .loincCode("I")
                .swabTypes(List.of(swab3.getInternalId()))
                .supportedDiseases(List.of(disease.getInternalId()))
                .testLength(2)
                .build());
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportSiteAdminUser
  void syncDevices_dedupesDevices() {
    LIVDResponse deviceOne =
        new LIVDResponse(
            "Manufacturer A",
            "Model A",
            List.of("specimen description"),
            "0123456",
            "TestKit A",
            "Equip A");
    LIVDResponse deviceTwo =
        new LIVDResponse(
            "Manufacturer A",
            "Model A",
            List.of("specimen description"),
            "0123456",
            "TestKit B",
            "Equip B");
    List<LIVDResponse> devices = List.of(deviceOne, deviceTwo);

    when(dataHubClient.getLIVDTable()).thenReturn(devices);
    // todo: get from db rather than return value
    var syncedDevices = deviceTypeService.syncDevices();
    assertThat(syncedDevices.size()).isEqualTo(1);
    var syncedDevice = syncedDevices.get(0);
    assertThat(syncedDevice.getTestKitNameId()).isEqualTo("TestKit A");
    assertThat(syncedDevice.getEquipmentUid()).isEqualTo("Equip A");
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportSiteAdminUser
  void syncDevices_updatesDevices() {
  // LIVDResponse for new device
    LIVDResponse newDevice =
            new LIVDResponse(
                    "Device A",
                    "Model A",
                    List.of("specimen description"),
                    "7777777",
                    "Updated TestKit",
                    "Updated Equip");

    List<LIVDResponse> devices = List.of(newDevice);

    when(dataHubClient.getLIVDTable()).thenReturn(devices);
    deviceTypeService.syncDevices();
    var updatedDevice = deviceTypeRepo.findDeviceTypeByManufacturerAndModel(newDevice.getManufacturer(), newDevice.getModel());
    assertTrue(updatedDevice.isPresent());
    assertThat(updatedDevice.get().getLoincCode()).isEqualTo("7777777");
    assertThat(updatedDevice.get().getTestKitNameId()).isEqualTo("Updated TestKit");
    assertThat(updatedDevice.get().getEquipmentUid()).isEqualTo("Updated Equip");
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportSiteAdminUser
  void syncDevices_createsDevices() {
    LIVDResponse newDevice =
            new LIVDResponse(
                    "New Device Manufacturer",
                    "New Device Model",
                    List.of("specimen description"),
                    "0123456",
                    "New TestKit",
                    "New Equip");

    List<LIVDResponse> devices = List.of(newDevice);

    when(dataHubClient.getLIVDTable()).thenReturn(devices);
    deviceTypeService.syncDevices();
    var createdDevice = deviceTypeRepo.findDeviceTypeByManufacturerAndModel(newDevice.getManufacturer(), newDevice.getModel());
    assertTrue(createdDevice.isPresent());
    assertThat(createdDevice.get().getManufacturer()).isEqualTo("New Device Manufacturer");
    assertThat(createdDevice.get().getModel()).isEqualTo("New Device Model");
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportSiteAdminUser
  void syncDevices_updatesSpecimenTypes() {
    var deviceSpecimenTypes = deviceSpecimenTypeRepository.findAllByDeviceType(devA);
    assertThat(deviceSpecimenTypes.size()).isEqualTo(1);
    LIVDResponse deviceOne =
        new LIVDResponse(
            devA.getManufacturer(),
            devA.getModel(),
            List.of(SPECIMEN_DESCRIPTION_ONE, SPECIMEN_DESCRIPTION_TWO),
            "0123456",
            "TestKit A",
            "Equip A");
    LIVDResponse deviceTwo =
        new LIVDResponse(
            devB.getManufacturer(),
            devB.getModel(),
            List.of(SPECIMEN_DESCRIPTION_ONE, SPECIMEN_DESCRIPTION_THREE),
            "0123456",
            "TestKit A",
            "Equip A");
    List<LIVDResponse> devices = List.of(deviceOne, deviceTwo);

    when(dataHubClient.getLIVDTable()).thenReturn(devices);

    deviceTypeService.syncDevices();

    // Brand-new specimen type from response added to DB
    var newSpecimenType = specimenTypeRepository.findByTypeCodeAndIsDeletedFalse("999999999");
    assertTrue(newSpecimenType.isPresent());

    // Second specimen type from response was added to device
    var updatedDeviceSpecimenTypesA = deviceSpecimenTypeRepository.findAllByDeviceType(devA);
    assertThat(updatedDeviceSpecimenTypesA.size()).isEqualTo(2);
    assertThat(
            updatedDeviceSpecimenTypesA.stream()
                .map(DeviceSpecimenType::getInternalId)
                .collect(Collectors.toList()))
        .containsOnly(swab1.getInternalId(), swab2.getInternalId());

    // Three device specimen types:
    //     - existed in database, added to device
    //     - did NOT exist in database, added to device
    //     - pre-existing specimen type for device not returned in response - not removed
    var updatedDeviceSpecimenTypesB = deviceSpecimenTypeRepository.findAllByDeviceType(devB);
    assertThat(updatedDeviceSpecimenTypesB.size()).isEqualTo(3);
    assertThat(
            updatedDeviceSpecimenTypesB.stream()
                .map(DeviceSpecimenType::getInternalId)
                .collect(Collectors.toList()))
        .containsOnly(swab1.getInternalId(), swab3.getInternalId(), newSpecimenType.get().getInternalId());
  }
}
