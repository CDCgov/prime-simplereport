package gov.cdc.usds.simplereport.service;

import static gov.cdc.usds.simplereport.test_util.TestDataBuilder.getAddress;
import static org.assertj.core.api.Assertions.assertThat;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.FacilityBuilder;
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
  private SpecimenType specimenType;

  @Test
  void updateSpecimenTypeTest() {

    // GIVEN
    specimenTypeRepository.deleteAll();
    List<SpecimenType> prodSpecimenTypes =
        List.of(
            new SpecimenType("Plasma Specimen", "119361006"),
            new SpecimenType("Serum Specimen", "119364003"),
            new SpecimenType("Whole Blood Sample", "258580003"),
            new SpecimenType("Nasopharyngeal Swab", "258500001"),
            new SpecimenType("Mid-Turbinate Nasal Swab", "871810001"),
            new SpecimenType("Anterior Nasal Swab", "697989009"),
            new SpecimenType("Nasal Swab", "445297001"),
            new SpecimenType("Oropharyngeal Swab", "258529004"),
            new SpecimenType("Nasopharyngeal Wash", "258467004"),
            new SpecimenType("Nasal and Throat Swab Combination", "433801000124107"),
            new SpecimenType("Nasal Washings", "433871000124101"),
            new SpecimenType("Bronchoalveolar Lavage", "258607008"),
            new SpecimenType("Sputum", "119334006"),
            new SpecimenType("Lower Respiratory Tract Aspirates", "309171007"),
            new SpecimenType("Nasal Wash/Aspirate", "429931000124105"),
            new SpecimenType("Saliva", "258560004"),
            new SpecimenType("Nasopharyngeal aspirate", "258411007"),
            new SpecimenType("Tracheal Aspirates", "445447003"),
            new SpecimenType("Induced Sputum", "258610001"),
            new SpecimenType("Expectorated Sputum", "119335007"));
    specimenTypeRepository.saveAll(prodSpecimenTypes);
    assertThat(specimenTypeRepository.findAll()).hasSize(20);

    // WHEN
    String log = deviceMigrationService.updateSpecimenTypes();

    // THEN
    assertThat(specimenTypeRepository.findAll()).hasSize(26);
    assertThat(log)
        .isEqualTo(
            """
      * setting specimenType name from: 'Anterior Nasal Swab' to: 'Anterior nares swab'
      * setting specimenType name from: 'Mid-Turbinate Nasal Swab' to: 'Mid-turbinate nasal swab'
      * setting specimenType name from: 'Nasopharyngeal Swab' to: 'Nasopharyngeal swab'
      * setting specimenType name from: 'Oropharyngeal Swab' to: 'Throat swab'
      * setting specimenType name from: 'Nasopharyngeal Wash' to: 'Nasopharyngeal washings'
      = Nasopharyngeal aspirate was left unchanged
      * setting specimenType name from: 'Nasal Wash/Aspirate' to: 'Nasal aspirate specimen'
      * setting specimenType name from: 'Nasal Swab' to: 'Swab of internal nose'
      * setting specimenType name from: 'Nasal and Throat Swab Combination' to: 'Nasopharyngeal and oropharyngeal swab'
      * setting specimenType name from: 'Serum Specimen' to: 'Serum specimen'
      * setting specimenType name from: 'Plasma Specimen' to: 'Plasma specimen'
      + created specimenType name: Venous blood specimen typecode: 122555007
      * setting specimenType name from: 'Bronchoalveolar Lavage' to: 'Bronchoalveolar lavage fluid sample'
      * setting specimenType name from: 'Whole Blood Sample' to: 'Whole blood sample'
      + created specimenType name: Capillary blood specimen typecode: 122554006
      * setting specimenType name from: 'Sputum' to: 'Sputum specimen'
      * setting specimenType name from: 'Nasal Washings' to: 'Nasal washings'
      * setting specimenType name from: 'Saliva' to: 'Oral saliva sample'
      * setting specimenType name from: 'Induced Sputum' to: 'Sputum specimen obtained by sputum induction'
      * setting specimenType name from: 'Expectorated Sputum' to: 'Coughed sputum specimen'
      * setting specimenType name from: 'Tracheal Aspirates' to: 'Specimen from trachea obtained by aspiration'
      * setting specimenType name from: 'Lower Respiratory Tract Aspirates' to: 'Lower respiratory fluid sample'
      + created specimenType name: Oral fluid specimen typecode: 441620008
      + created specimenType name: Specimen obtained by bronchial aspiration typecode: 441903006
      + created specimenType name: Exhaled air specimen typecode: 119336008
      + created specimenType name: Dried blood spot specimen typecode: 440500007
      """
                .trim());
    System.out.println(log);
  }

  @Test
  void mergeDuplicateDevicesTest() {

    // GIVEN
    org = organizationRepository.save(new Organization("My Office", "other", "650Mass", true));
    specimenType = specimenTypeRepository.save(new SpecimenType("gum swab", "0001111234"));

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
            FacilityBuilder.builder()
                .org(org)
                .facilityName(UUID.randomUUID().toString())
                .cliaNumber("123456")
                .facilityAddress(getAddress())
                .phone("555-867-5309")
                .email("facility@test.com")
                .orderingProvider(
                    providerRepository.save(
                        new Provider("Doc", "", "", "", "NCC1701", null, "(1) (111) 2222222")))
                .defaultDeviceType(defaultDevice)
                .defaultSpecimenType(specimenType)
                .configuredDevices(configuredDevices)
                .build()));
  }
}
