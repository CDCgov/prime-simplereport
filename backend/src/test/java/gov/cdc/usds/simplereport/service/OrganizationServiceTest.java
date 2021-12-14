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

  @Autowired private TestDataFactory testDataFactory;
  @Autowired private PatientRegistrationLinkRepository patientRegistrationLinkRepository;
  @Autowired private FacilityRepository facilityRepository;
  @Autowired private OrganizationRepository organizationRepository;

  @Autowired private DeviceTypeRepository deviceTypeRepository;
  @Autowired private SpecimenTypeRepository specimenTypeRepository;

  @BeforeEach
  void setupData() {
    initSampleData();
  }

  @Test
  void getCurrentOrg_success() {
    Organization org = _service.getCurrentOrganization();
    assertNotNull(org);
    assertEquals("DIS_ORG", org.getExternalId());
  }

  @Test
  void createOrganizationAndFacility_success() {
    // GIVEN
    DeviceSpecimenType dst = getDeviceConfig();
    PersonName orderingProviderName = new PersonName("Bill", "Foo", "Nye", "");

    // WHEN
    Organization org =
        _service.createOrganizationAndFacility(
            "Tim's org",
            "k12",
            "d6b3951b-6698-4ee7-9d63-aaadee85bac0",
            "Facility 1",
            "12345",
            testDataFactory.getAddress(),
            "123-456-7890",
            "test@foo.com",
            List.of(dst.getDeviceType().getInternalId()),
            orderingProviderName,
            testDataFactory.getAddress(),
            "123-456-7890",
            "547329472");
    // THEN
    assertEquals("Tim's org", org.getOrganizationName());
    assertFalse(org.getIdentityVerified());
    assertEquals("d6b3951b-6698-4ee7-9d63-aaadee85bac0", org.getExternalId());
    List<Facility> facilities = _service.getFacilities(org);
    assertNotNull(facilities);
    assertEquals(1, facilities.size());

    Facility fac = facilities.get(0);
    assertEquals("Facility 1", fac.getFacilityName());
    assertNotNull(fac.getDefaultDeviceType());
    assertEquals("Abbott ID Now", fac.getDefaultDeviceType().getName());

    PatientSelfRegistrationLink orgLink =
        patientRegistrationLinkRepository.findByOrganization(org).get();
    PatientSelfRegistrationLink facLink =
        patientRegistrationLinkRepository.findByFacility(fac).get();
    assertEquals(5, orgLink.getLink().length());
    assertEquals(5, facLink.getLink().length());
  }

  private DeviceSpecimenType getDeviceConfig() {
    DeviceType device =
        testDataFactory.createDeviceType("Abbott ID Now", "Abbott", "1", "12345-6", "E");
    SpecimenType specimen = testDataFactory.getGenericSpecimen();
    return testDataFactory.createDeviceSpecimen(device, specimen);
  }

  @Test
  void createOrganizationAndFacility_orderingProviderRequired_failure() {
    // GIVEN
    DeviceSpecimenType dst = getDeviceConfig();
    PersonName orderProviderName = new PersonName("Bill", "Foo", "Nye", "");
    // THEN
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
              List.of(dst.getDeviceType().getInternalId()),
              orderProviderName,
              _dataFactory.getAddress(),
              null,
              null);
        });
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void getOrganizationsAndFacility_filterByIdentityVerified_success() {
    // GIVEN
    Organization verifiedOrg = testDataFactory.createValidOrg();
    Organization unverifiedOrg = testDataFactory.createUnverifiedOrg();

    // WHEN
    List<Organization> allOrgs = _service.getOrganizations(null);
    List<Organization> verifiedOrgs = _service.getOrganizations(true);
    List<Organization> unverifiedOrgs = _service.getOrganizations(false);

    // THEN
    assertTrue(allOrgs.size() >= 2);
    Set<String> allOrgIds =
        allOrgs.stream().map(Organization::getExternalId).collect(Collectors.toSet());
    assertTrue(allOrgIds.contains(verifiedOrg.getExternalId()));
    assertTrue(allOrgIds.contains(unverifiedOrg.getExternalId()));

    assertTrue(verifiedOrgs.size() >= 1);
    Set<String> verifiedOrgIds =
        verifiedOrgs.stream().map(Organization::getExternalId).collect(Collectors.toSet());
    assertTrue(verifiedOrgIds.contains(verifiedOrg.getExternalId()));
    assertFalse(verifiedOrgIds.contains(unverifiedOrg.getExternalId()));

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
    // GIVEN
    Organization verifiedOrg = testDataFactory.createValidOrg();
    Facility mistakeFacility =
        testDataFactory.createValidFacility(verifiedOrg, "This facility is a mistake");
    // WHEN
    Facility deletedFacility =
        _service.markFacilityAsDeleted(mistakeFacility.getInternalId(), true);
    // THEN
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
    Organization org = testDataFactory.createUnverifiedOrg();
    _service.verifyOrganizationNoPermissions(org.getExternalId());

    org = _service.getOrganization(org.getExternalId());
    assertTrue(org.getIdentityVerified());
  }

  @Test
  void verifyOrganizationNoPermissions_orgAlreadyVerified_failure() {
    Organization org = testDataFactory.createValidOrg();
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
    private StreetAddress newFacilityAddress;
    private StreetAddress newOrderingProviderAddress;

    @BeforeEach
    void beforeEach() {
      // GIVEN
      List<Organization> disOrgs = organizationRepository.findAllByName("Dis Organization");
      assertThat(disOrgs).hasSize(1);
      Organization disOrg = disOrgs.get(0);

      facility =
          facilityRepository.findByOrganizationAndFacilityName(disOrg, "Injection Site").get();
      assertThat(facility).isNotNull();
      devices = deviceTypeRepository.findAll();

      newFacilityAddress = new StreetAddress("0", "1", "2", "3", "4", "5");
      newOrderingProviderAddress = new StreetAddress("6", "7", "8", "9", "10", "11");
      PersonName orderingProviderName = new PersonName("Bill", "Foo", "Nye", "Jr.");

      // WHEN
      _service.updateFacility(
          facility.getInternalId(),
          "new name",
          "new clia",
          newFacilityAddress,
          "817-555-6666",
          "facility@dis.org",
          orderingProviderName,
          newOrderingProviderAddress,
          "npi",
          "817-555-7777",
          List.of(devices.get(0).getInternalId(), devices.get(1).getInternalId()));
    }

    @Test
    @DisplayName("it should update the facility with new values")
    @WithSimpleReportOrgAdminUser
    void updateFacilityTest() {
      // THEN
      Facility updatedFacility = facilityRepository.findById(facility.getInternalId()).get();

      assertThat(updatedFacility).isNotNull();
      assertThat(updatedFacility.getFacilityName()).isEqualTo("new name");
      assertThat(updatedFacility.getCliaNumber()).isEqualTo("new clia");
      assertThat(updatedFacility.getTelephone()).isEqualTo("817-555-6666");
      assertThat(updatedFacility.getEmail()).isEqualTo("facility@dis.org");
      assertThat(updatedFacility.getAddress()).isEqualTo(newFacilityAddress);

      assertThat(updatedFacility.getOrderingProvider().getNameInfo().getFirstName())
          .isEqualTo("Bill");
      assertThat(updatedFacility.getOrderingProvider().getNameInfo().getMiddleName())
          .isEqualTo("Foo");
      assertThat(updatedFacility.getOrderingProvider().getNameInfo().getLastName())
          .isEqualTo("Nye");
      assertThat(updatedFacility.getOrderingProvider().getNameInfo().getSuffix()).isEqualTo("Jr.");
      assertThat(updatedFacility.getOrderingProvider().getProviderId()).isEqualTo("npi");
      assertThat(updatedFacility.getOrderingProvider().getAddress())
          .isEqualTo(newOrderingProviderAddress);

      assertThat(updatedFacility.getDeviceTypes()).hasSize(2);
    }
  }
}
