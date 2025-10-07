package gov.cdc.usds.simplereport.api.devicetype;

import static java.util.Collections.emptyList;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.db.model.DeviceTypeDisease;
import gov.cdc.usds.simplereport.db.model.DeviceTypeSpecimenTypeMapping;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.repository.DeviceSpecimenTypeNewRepository;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeDiseaseRepository;
import gov.cdc.usds.simplereport.db.repository.SpecimenTypeRepository;
import gov.cdc.usds.simplereport.service.DiseaseService;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
class DeviceTypeDataLoaderHelperTest {

  @Mock DiseaseService diseaseService;
  @Mock DeviceSpecimenTypeNewRepository deviceSpecimenTypeNewRepository;
  @Mock SpecimenTypeRepository specimenTypeRepository;
  @Mock DeviceTypeDiseaseRepository deviceTypeDiseaseRepository;

  @InjectMocks private DeviceTypeDataLoaderService deviceTypeDataLoaderService;

  @Test
  void getSupportedDiseases_happyPath() {
    // GIVEN
    UUID device1Id = UUID.randomUUID();
    UUID device2Id = UUID.randomUUID();
    UUID device3Id = UUID.randomUUID();
    Set<UUID> deviceSet = Set.of(device1Id, device2Id, device3Id);
    UUID supportedDisease1Id = UUID.randomUUID();
    UUID supportedDisease2Id = UUID.randomUUID();
    String testPerformedLoinc = "test123PerformedLoinc";
    String equipmentUid = "testEquipmentUid";
    String testkitNameId = "testkitNameId";
    String testOrderedLoinc = "test123OrderedLoinc";

    SupportedDisease supportedDisease1 = mock(SupportedDisease.class);
    SupportedDisease supportedDisease2 = mock(SupportedDisease.class);

    when(supportedDisease1.getInternalId()).thenReturn(supportedDisease1Id);
    when(supportedDisease2.getInternalId()).thenReturn(supportedDisease2Id);

    when(diseaseService.getKnownSupportedDiseasesMap())
        .thenReturn(
            Map.of(
                supportedDisease1Id, supportedDisease1,
                supportedDisease2Id, supportedDisease2));

    when(deviceTypeDiseaseRepository.findAllByDeviceTypeIdIn(deviceSet))
        .thenReturn(
            List.of(
                new DeviceTypeDisease(
                    device1Id,
                    supportedDisease1,
                    testPerformedLoinc,
                    equipmentUid,
                    testkitNameId,
                    testOrderedLoinc),
                new DeviceTypeDisease(
                    device2Id,
                    supportedDisease1,
                    testPerformedLoinc,
                    equipmentUid,
                    testkitNameId,
                    testOrderedLoinc),
                new DeviceTypeDisease(
                    device2Id,
                    supportedDisease2,
                    testPerformedLoinc,
                    equipmentUid,
                    testkitNameId,
                    testOrderedLoinc)));

    // WHEN
    Map<UUID, List<SupportedDisease>> supportedDiseases =
        deviceTypeDataLoaderService.getSupportedDiseases(deviceSet);

    // THEN
    assertThat(supportedDiseases)
        .hasSize(3)
        .containsEntry(device1Id, List.of(supportedDisease1))
        .containsEntry(device2Id, List.of(supportedDisease1, supportedDisease2))
        .containsEntry(device3Id, emptyList());
  }

  @Test
  void getSpecimenTypes_happyPath() {
    // GIVEN
    UUID device1Id = UUID.randomUUID();
    UUID device2Id = UUID.randomUUID();
    UUID device3Id = UUID.randomUUID();
    Set<UUID> deviceSet = Set.of(device1Id, device2Id, device3Id);

    UUID specimenType1Id = UUID.randomUUID();
    UUID specimenType2Id = UUID.randomUUID();
    List<UUID> specimenIdList = List.of(specimenType1Id, specimenType2Id);
    SpecimenType specimenType1 = mock(SpecimenType.class);
    SpecimenType specimenType2 = mock(SpecimenType.class);

    when(specimenType1.getInternalId()).thenReturn(specimenType1Id);
    when(specimenType2.getInternalId()).thenReturn(specimenType2Id);

    when(deviceSpecimenTypeNewRepository.findAllByDeviceTypeIdIn(deviceSet))
        .thenReturn(
            List.of(
                new DeviceTypeSpecimenTypeMapping(device1Id, specimenType1Id),
                new DeviceTypeSpecimenTypeMapping(device2Id, specimenType1Id),
                new DeviceTypeSpecimenTypeMapping(device2Id, specimenType2Id)));

    when(specimenTypeRepository.findAllByInternalIdIn(specimenIdList))
        .thenReturn(List.of(specimenType1, specimenType2));

    // WHEN
    Map<UUID, List<SpecimenType>> specimenTypes =
        deviceTypeDataLoaderService.getSpecimenTypes(deviceSet);

    // THEN
    assertThat(specimenTypes)
        .hasSize(3)
        .containsEntry(device1Id, List.of(specimenType1))
        .containsEntry(device2Id, List.of(specimenType1, specimenType2))
        .containsEntry(device3Id, emptyList());
  }

  @Test
  void getDeviceTypeDisease() {
    var device1Id = UUID.randomUUID();
    var device2Id = UUID.randomUUID();
    var device3Id = UUID.randomUUID();
    var deviceIdSet = Set.of(device1Id, device2Id, device3Id);

    var deviceTypeDisease1 =
        DeviceTypeDisease.builder()
            .deviceTypeId(device1Id)
            .testPerformedLoincCode("123")
            .supportedDisease(new SupportedDisease())
            .equipmentUid("111")
            .testkitNameId("222")
            .testOrderedLoincCode("234")
            .build();
    var deviceTypeDisease2 =
        DeviceTypeDisease.builder()
            .deviceTypeId(device1Id)
            .testPerformedLoincCode("456")
            .supportedDisease(new SupportedDisease())
            .equipmentUid("333")
            .testkitNameId("444")
            .testOrderedLoincCode("345")
            .build();
    var deviceTypeDisease3 =
        DeviceTypeDisease.builder()
            .deviceTypeId(device2Id)
            .testPerformedLoincCode("123")
            .supportedDisease(new SupportedDisease())
            .equipmentUid("555")
            .testkitNameId("666")
            .testOrderedLoincCode("244")
            .build();

    when(deviceTypeDiseaseRepository.findAllByDeviceTypeIdIn(deviceIdSet))
        .thenReturn(List.of(deviceTypeDisease1, deviceTypeDisease2, deviceTypeDisease3));

    var actual = deviceTypeDataLoaderService.getDeviceTypeDisease(deviceIdSet);

    assertThat(actual)
        .hasSize(3)
        .containsEntry(device1Id, List.of(deviceTypeDisease1, deviceTypeDisease2))
        .containsEntry(device2Id, List.of(deviceTypeDisease3))
        .containsEntry(device3Id, emptyList());
  }
}
