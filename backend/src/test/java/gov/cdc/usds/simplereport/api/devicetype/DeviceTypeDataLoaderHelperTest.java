package gov.cdc.usds.simplereport.api.devicetype;

import static java.util.Collections.emptyList;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.db.model.DeviceSupportedDisease;
import gov.cdc.usds.simplereport.db.model.DeviceTypeSpecimenTypeMapping;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.repository.DeviceSpecimenTypeNewRepository;
import gov.cdc.usds.simplereport.db.repository.DeviceSupportedDiseaseRepository;
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

  @Mock DeviceSupportedDiseaseRepository deviceSupportedDiseaseRepository;
  @Mock DiseaseService diseaseService;
  @Mock DeviceSpecimenTypeNewRepository deviceSpecimenTypeNewRepository;
  @Mock SpecimenTypeRepository specimenTypeRepository;

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

    SupportedDisease supportedDisease1 = mock(SupportedDisease.class);
    SupportedDisease supportedDisease2 = mock(SupportedDisease.class);

    when(supportedDisease1.getInternalId()).thenReturn(supportedDisease1Id);
    when(supportedDisease2.getInternalId()).thenReturn(supportedDisease2Id);

    when(diseaseService.getKnownSupportedDiseasesMap())
        .thenReturn(
            Map.of(
                supportedDisease1Id, supportedDisease1,
                supportedDisease2Id, supportedDisease2));

    when(deviceSupportedDiseaseRepository.findAllByDeviceTypeIdIn(deviceSet))
        .thenReturn(
            List.of(
                new DeviceSupportedDisease(device1Id, supportedDisease1Id),
                new DeviceSupportedDisease(device2Id, supportedDisease1Id),
                new DeviceSupportedDisease(device2Id, supportedDisease2Id)));

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
}
