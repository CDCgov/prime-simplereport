package gov.cdc.usds.simplereport.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.api.model.errors.OrderingProviderRequiredException;
import gov.cdc.usds.simplereport.db.model.DeviceSpecimenType;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientSelfRegistrationLink;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import gov.cdc.usds.simplereport.db.repository.FacilityRepository;
import gov.cdc.usds.simplereport.db.repository.OrganizationRepository;
import gov.cdc.usds.simplereport.db.repository.PatientRegistrationLinkRepository;
import gov.cdc.usds.simplereport.db.repository.SpecimenTypeRepository;
import gov.cdc.usds.simplereport.service.model.DeviceSpecimenTypeHolder;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportOrgAdminUser;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportSiteAdminUser;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.TestPropertySource;

@TestPropertySource(properties = "hibernate.query.interceptor.error-level=ERROR")
class OrganizationServiceTest extends BaseServiceTest<OrganizationService> {

  @Autowired private TestDataFactory _dataFactory;
  @Autowired private PatientRegistrationLinkRepository _prlRepo;
  @Autowired private FacilityRepository facilityRepository;
  @Autowired private OrganizationRepository organizationRepository;

  @Autowired private DeviceTypeRepository deviceTypeRepository;
  @Autowired private SpecimenTypeRepository specimenTypeRepository;

  @BeforeEach
  void setupData() {
    initSampleData();
  }

  @Test
  void findit() {
    Organization org = _service.getCurrentOrganization();
    assertNotNull(org);
    assertEquals("DIS_ORG", org.getExternalId());
  }

  @Test
  void createOrganizationAndFacility_standardUser_error() {
    DeviceSpecimenTypeHolder holder = getDeviceConfig();
    PersonName bill = new PersonName("Bill", "Foo", "Nye", "");
    Organization org =
        _service.createOrganizationAndFacility(
            "Tim's org",
            "k12",
            "d6b3951b-6698-4ee7-9d63-aaadee85bac0",
            "Facility 1",
            "12345",
            _dataFactory.getAddress(),
            "123-456-7890",
            "test@foo.com",
            holder,
            bill,
            _dataFactory.getAddress(),
            "123-456-7890",
            "547329472");

    assertEquals("Tim's org", org.getOrganizationName());
    assertFalse(org.getIdentityVerified());
    assertEquals("d6b3951b-6698-4ee7-9d63-aaadee85bac0", org.getExternalId());
    List<Facility> facilities = _service.getFacilities(org);
    assertNotNull(facilities);
    assertEquals(1, facilities.size());

    Facility fac = facilities.get(0);
    assertEquals("Facility 1", fac.getFacilityName());
    assertNotNull(fac.getDefaultDeviceType());
    assertEquals("Bill", fac.getDefaultDeviceType().getName());

    PatientSelfRegistrationLink orgLink = _prlRepo.findByOrganization(org).get();
    PatientSelfRegistrationLink facLink = _prlRepo.findByFacility(fac).get();
    assertEquals(5, orgLink.getLink().length());
    assertEquals(5, facLink.getLink().length());
  }

  private DeviceSpecimenTypeHolder getDeviceConfig() {
    DeviceType device = _dataFactory.createDeviceType("Bill", "Weasleys", "1", "12345-6", "E");
    SpecimenType specimen = _dataFactory.getGenericSpecimen();
    DeviceSpecimenType dst = _dataFactory.createDeviceSpecimen(device, specimen);
    DeviceSpecimenTypeHolder holder = new DeviceSpecimenTypeHolder(dst, List.of(dst));
    return holder;
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void createOrganizationAndFacility_adminUser_success() {
    DeviceSpecimenTypeHolder holder = getDeviceConfig();
    PersonName bill = new PersonName("Bill", "Foo", "Nye", "");
    Organization org =
        _service.createOrganizationAndFacility(
            "Tim's org",
            "university",
            "d6b3951b-6698-4ee7-9d63-aaadee85bac0",
            "Facility 1",
            "12345",
            _dataFactory.getAddress(),
            "123-456-7890",
            "test@foo.com",
            holder,
            bill,
            _dataFactory.getAddress(),
            "123-456-7890",
            "547329472");

    assertEquals("Tim's org", org.getOrganizationName());
    assertFalse(org.getIdentityVerified());
    assertEquals("d6b3951b-6698-4ee7-9d63-aaadee85bac0", org.getExternalId());
    List<Facility> facilities = _service.getFacilities(org);
    assertNotNull(facilities);
    assertEquals(1, facilities.size());
    Facility fac = facilities.get(0);
    assertEquals("Facility 1", fac.getFacilityName());
    assertNotNull(fac.getDefaultDeviceType());
    assertEquals("Bill", fac.getDefaultDeviceType().getName());

    PatientSelfRegistrationLink orgLink = _prlRepo.findByOrganization(org).get();
    PatientSelfRegistrationLink facLink = _prlRepo.findByFacility(fac).get();
    assertEquals(5, orgLink.getLink().length());
    assertEquals(5, facLink.getLink().length());
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void createOrganizationAndFacility_orderingProviderRequired_failure() {
    DeviceSpecimenTypeHolder holder = getDeviceConfig();
    PersonName bill = new PersonName("Bill", "Foo", "Nye", "");
    assertThrows(
        OrderingProviderRequiredException.class,
        () -> {
          _service.createOrganizationAndFacility(
              "Adam's org",
              "urgent_care",
              "d6b3951b-6698-4ee7-9d63-aaadee85bac0",
              "Facility 1",
              "12345",
              _dataFactory.getAddress(),
              "123-456-7890",
              "test@foo.com",
              holder,
              bill,
              _dataFactory.getAddress(),
              null,
              null);
        });
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void getOrganizationsAndFacility_filterByIdentityVerified_success() {
    Organization verifiedOrg = _dataFactory.createValidOrg();
    Organization unverifiedOrg = _dataFactory.createUnverifiedOrg();
    List<Organization> allOrgs = _service.getOrganizations(null);
    // initSampleData() creates other verified orgs besides our locally created orgs
    assertTrue(allOrgs.size() >= 2);
    Set<String> allOrgIds =
        allOrgs.stream().map(Organization::getExternalId).collect(Collectors.toSet());
    assertTrue(allOrgIds.contains(verifiedOrg.getExternalId()));
    assertTrue(allOrgIds.contains(unverifiedOrg.getExternalId()));

    List<Organization> verifiedOrgs = _service.getOrganizations(true);
    assertTrue(verifiedOrgs.size() >= 1);
    Set<String> verifiedOrgIds =
        verifiedOrgs.stream().map(Organization::getExternalId).collect(Collectors.toSet());
    assertTrue(verifiedOrgIds.contains(verifiedOrg.getExternalId()));
    assertFalse(verifiedOrgIds.contains(unverifiedOrg.getExternalId()));

    List<Organization> unverifiedOrgs = _service.getOrganizations(false);
    assertEquals(1, unverifiedOrgs.size());
    Set<String> unverifiedOrgIds =
        unverifiedOrgs.stream().map(Organization::getExternalId).collect(Collectors.toSet());
    assertFalse(unverifiedOrgIds.contains(verifiedOrg.getExternalId()));
    assertTrue(unverifiedOrgIds.contains(unverifiedOrg.getExternalId()));
  }

  @Test
  @DisplayName("it should allow global admins to mark facility as deleted")
  @WithSimpleReportSiteAdminUser
  void deleteFacilityTest_successful() {
    Organization verifiedOrg = _dataFactory.createValidOrg();
    Facility mistakeFacility =
        _dataFactory.createValidFacility(verifiedOrg, "This facility is a mistake");
    Facility deletedFacility =
        _service.markFacilityAsDeleted(mistakeFacility.getInternalId(), true);
    assertThat(deletedFacility.isDeleted()).isTrue();
  }

  @Test
  @DisplayName("it should not delete nonexistent facilities")
  @WithSimpleReportSiteAdminUser
  void deletedFacilityTest_throwsErrorWhenFacilityNotFound() {
    IllegalGraphqlArgumentException caught =
        assertThrows(
            IllegalGraphqlArgumentException.class,
            // fake UUID
            () -> _service.markFacilityAsDeleted(UUID.randomUUID(), true));
    assertEquals("Facility not found.", caught.getMessage());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void adminUpdateOrganization_not_allowed() {
    AccessDeniedException caught =
        assertThrows(
            AccessDeniedException.class, () -> _service.updateOrganization("Foo org", "k12"));
    assertEquals("Access is denied", caught.getMessage());
  }

  @Test
  void verifyOrganizationNoPermissions_noUser_success() {
    Organization org = _dataFactory.createUnverifiedOrg();
    _service.verifyOrganizationNoPermissions(org.getExternalId());

    org = _service.getOrganization(org.getExternalId());
    assertTrue(org.getIdentityVerified());
  }

  @Test
  void verifyOrganizationNoPermissions_orgAlreadyVerified_failure() {
    Organization org = _dataFactory.createValidOrg();
    String orgExternalId = org.getExternalId();
    IllegalStateException e =
        assertThrows(
            IllegalStateException.class,
            () -> _service.verifyOrganizationNoPermissions(orgExternalId));

    assertEquals("Organization is already verified.", e.getMessage());
  }

  @Nested
  @DisplayName("When updating a facility")
  class UpdateFacilityTest {
    private Facility facility;
    private List<DeviceType> devices;
    private List<SpecimenType> specimenTypes;
    private StreetAddress newFacilityAddress;
    private StreetAddress newOrderingProviderAddress;

    @BeforeEach
    void beforeEach() {
      List<Organization> disOrgs = organizationRepository.findAllByName("Dis Organization");
      assertThat(disOrgs).hasSize(1);
      Organization disOrg = disOrgs.get(0);

      facility =
          facilityRepository.findByOrganizationAndFacilityName(disOrg, "Injection Site").get();
      assertThat(facility).isNotNull();

      devices = deviceTypeRepository.findAll();
      specimenTypes = specimenTypeRepository.findAll();

      newFacilityAddress = new StreetAddress("0", "1", "2", "3", "4", "5");
      newOrderingProviderAddress = new StreetAddress("6", "7", "8", "9", "10", "11");
      _service.updateFacility(
          facility.getInternalId(),
          "new name",
          "new clia",
          newFacilityAddress,
          "817-555-6666",
          "facility@dis.org",
          "dr. provider",
          "very",
          "expensive",
          "jr.",
          "npi",
          newOrderingProviderAddress,
          "817-555-7777",
          new DeviceSpecimenTypeHolder(
              new DeviceSpecimenType(devices.get(0), specimenTypes.get(0)),
              List.of(
                  new DeviceSpecimenType(devices.get(0), specimenTypes.get(0)),
                  new DeviceSpecimenType(devices.get(1), specimenTypes.get(0)))));
    }

    @Test
    @DisplayName("it should update the facility with new values")
    @WithSimpleReportOrgAdminUser
    void updateFacilityTest() {
      Facility updatedFacility = facilityRepository.findById(facility.getInternalId()).get();

      assertThat(updatedFacility).isNotNull();
      assertThat(updatedFacility.getFacilityName()).isEqualTo("new name");
      assertThat(updatedFacility.getCliaNumber()).isEqualTo("new clia");
      assertThat(updatedFacility.getTelephone()).isEqualTo("817-555-6666");
      assertThat(updatedFacility.getEmail()).isEqualTo("facility@dis.org");
      assertThat(updatedFacility.getAddress()).isEqualTo(newFacilityAddress);

      assertThat(updatedFacility.getOrderingProvider().getNameInfo().getFirstName())
          .isEqualTo("dr. provider");
      assertThat(updatedFacility.getOrderingProvider().getNameInfo().getMiddleName())
          .isEqualTo("very");
      assertThat(updatedFacility.getOrderingProvider().getNameInfo().getLastName())
          .isEqualTo("expensive");
      assertThat(updatedFacility.getOrderingProvider().getNameInfo().getSuffix()).isEqualTo("jr.");
      assertThat(updatedFacility.getOrderingProvider().getProviderId()).isEqualTo("npi");
      assertThat(updatedFacility.getOrderingProvider().getAddress())
          .isEqualTo(newOrderingProviderAddress);

      assertThat(updatedFacility.getDeviceSpecimenTypes()).hasSize(2);
    }

    @Nested
    @DisplayName("when changing default device")
    class UpdatingDefaultDevice {
      @BeforeEach
      void beforeEach() {
        _service.updateFacility(
            facility.getInternalId(),
            "new name",
            "new clia",
            new StreetAddress("", "", "", "", "", ""),
            "817-555-6666",
            "facility@dis.org",
            "dr. provider",
            "very",
            "expensive",
            "jr.",
            "npi",
            new StreetAddress("", "", "", "", "", ""),
            "817-555-7777",
            new DeviceSpecimenTypeHolder(
                new DeviceSpecimenType(devices.get(1), specimenTypes.get(0)),
                List.of(
                    new DeviceSpecimenType(devices.get(0), specimenTypes.get(0)),
                    new DeviceSpecimenType(devices.get(1), specimenTypes.get(0)))));
      }

      @Test
      @DisplayName("it should update default device and retain deviceSepcimenTypes")
      @WithSimpleReportOrgAdminUser
      void updateDefaultDevice() {
        Facility updatedFacility = facilityRepository.findById(facility.getInternalId()).get();
        assertThat(updatedFacility.getDefaultDeviceSpecimen().getDeviceType().getInternalId())
            .isEqualTo(devices.get(1).getInternalId());
        assertThat(updatedFacility.getDefaultDeviceSpecimen().getSpecimenType().getInternalId())
            .isEqualTo(specimenTypes.get(0).getInternalId());
        assertThat(updatedFacility.getDeviceSpecimenTypes()).hasSize(2);
      }
    }
  }
}
