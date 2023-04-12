package gov.cdc.usds.simplereport.service;

import static gov.cdc.usds.simplereport.test_util.TestDataBuilder.getAddress;
import static org.assertj.core.api.Assertions.assertThat;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.IdentifiedEntity;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Provider;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import gov.cdc.usds.simplereport.db.repository.FacilityRepository;
import gov.cdc.usds.simplereport.db.repository.OrganizationRepository;
import gov.cdc.usds.simplereport.db.repository.ProviderRepository;
import gov.cdc.usds.simplereport.db.repository.SpecimenTypeRepository;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.jetbrains.annotations.NotNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

@SliceTestConfiguration.WithSimpleReportSiteAdminUser
class DeviceMigrationServiceTest extends BaseServiceTest<DeviceMigrationService> {
  @Autowired private DeviceTypeRepository deviceTypeRepository;
  @Autowired private SpecimenTypeRepository specimenTypeRepository;
  @Autowired private ProviderRepository providerRepository;
  @Autowired private OrganizationRepository organizationRepository;
  @Autowired private FacilityRepository facilityRepository;
  @Autowired private DeviceMigrationService deviceMigrationService;

  private Organization org;
  private SpecimenType spec;

  @BeforeEach
  void setup() {}

  @Test
  public void mergeDuplicateDevicesTest() {

    // GIVEN
    org = organizationRepository.save(new Organization("My Office", "other", "650Mass", true));
    spec = specimenTypeRepository.save(new SpecimenType("gum swab", "0001111234"));

    List<DeviceType> configuredDevices = new ArrayList<>();
    DeviceType other = deviceTypeRepository.save(new DeviceType("Other", "Weasleys", "1", 15));
    DeviceType original =
        deviceTypeRepository.save(
            new DeviceType("Abbott Alinity M - Flu + COVID-19 (RT-PCR)", "Weasleys", "1", 15));
    DeviceType duplicate =
        deviceTypeRepository.save(
            new DeviceType("Abbott Alinity M - COVID-19 (RT-PCR)", "Weasleys", "2", 15));

    configuredDevices.add(duplicate);
    configuredDevices.add(other);
    Facility facility1 = createFacility(configuredDevices, duplicate);
    Facility facility2 = createFacility(configuredDevices, original);

    // WHEN
    deviceMigrationService.mergeDuplicateDevices();

    // THEN

    other = deviceTypeRepository.findById(other.getInternalId()).orElseThrow();
    original = deviceTypeRepository.findById(original.getInternalId()).orElseThrow();
    duplicate = deviceTypeRepository.findById(duplicate.getInternalId()).orElseThrow();
    facility1 = facilityRepository.findById(facility1.getInternalId()).orElseThrow();
    facility2 = facilityRepository.findById(facility2.getInternalId()).orElseThrow();

    // deleted the duplicate device
    assertThat(duplicate.isDeleted()).isTrue();
    assertThat(original.isDeleted()).isFalse();
    assertThat(other.isDeleted()).isFalse();

    // swapped the default device
    assertThat(facility1.getDefaultDeviceType()).isNull();
    assertThat(facility2.getDefaultDeviceType().getInternalId())
        .isEqualTo(original.getInternalId());

    // swapped the device list
    assertThat(facility1.getDeviceTypes().stream().map(IdentifiedEntity::getInternalId))
        .contains(original.getInternalId(), other.getInternalId())
        .doesNotContain(duplicate.getInternalId());

    assertThat(facility2.getDeviceTypes().stream().map(IdentifiedEntity::getInternalId))
        .contains(original.getInternalId(), other.getInternalId())
        .doesNotContain(duplicate.getInternalId());
  }

  @NotNull
  private Facility createFacility(List<DeviceType> configuredDevices, DeviceType defaultDevice) {

    return facilityRepository.save(
        new Facility(
            org,
            UUID.randomUUID().toString(),
            "123456",
            getAddress(),
            "555-867-5309",
            "facility@test.com",
            providerRepository.save(
                new Provider("Doc", "", "", "", "NCC1701", null, "(1) (111) 2222222")),
            defaultDevice,
            spec,
            configuredDevices));
  }
}
