package gov.cdc.usds.simplereport.service;

import static gov.cdc.usds.simplereport.test_util.TestDataBuilder.getAddress;
import static graphql.Assert.assertNull;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;

import gov.cdc.usds.simplereport.api.model.FacilityStats;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.api.model.errors.OrderingProviderRequiredException;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientSelfRegistrationLink;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import gov.cdc.usds.simplereport.db.repository.FacilityRepository;
import gov.cdc.usds.simplereport.db.repository.OrganizationRepository;
import gov.cdc.usds.simplereport.db.repository.PatientRegistrationLinkRepository;
import gov.cdc.usds.simplereport.db.repository.PersonRepository;
import gov.cdc.usds.simplereport.idp.repository.OktaRepository;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportOrgAdminUser;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportSiteAdminUser;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportStandardUser;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.TestPropertySource;

@TestPropertySource(properties = "hibernate.query.interceptor.error-level=ERROR")
class OrganizationServiceTest extends BaseServiceTest<OrganizationService> {

  @Autowired private TestDataFactory testDataFactory;
  @Autowired private PatientRegistrationLinkRepository patientRegistrationLinkRepository;
  @Autowired @SpyBean private FacilityRepository facilityRepository;
  @Autowired private OrganizationRepository organizationRepository;
  @Autowired private DeviceTypeRepository deviceTypeRepository;
  @Autowired @SpyBean private OktaRepository oktaRepository;
  @Autowired @SpyBean private PersonRepository personRepository;

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
  void getOrganizationById_success() {
    Organization createdOrg = _dataFactory.saveValidOrganization();
    Organization foundOrg = _service.getOrganizationById(createdOrg.getInternalId());
    assertNotNull(foundOrg);
    assertEquals(createdOrg.getExternalId(), foundOrg.getExternalId());
  }

  @Test
  void getOrganizationById_failure() {
    UUID fakeUUID = UUID.randomUUID();
    IllegalGraphqlArgumentException caught =
        assertThrows(
            IllegalGraphqlArgumentException.class, () -> _service.getOrganizationById(fakeUUID));
    assertEquals(
        "An organization with internal_id=" + fakeUUID + " does not exist", caught.getMessage());
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void getOrganizationWithExternalIdAsSiteAdmin_success() {
    Organization createdOrg = _dataFactory.saveValidOrganization();
    Organization foundOrg = _service.getOrganizationById(createdOrg.getInternalId());
    assertNotNull(foundOrg);
    assertEquals(createdOrg.getExternalId(), foundOrg.getExternalId());
  }

  @Test
  void createOrganizationAndFacility_success() {
    // GIVEN
    PersonName orderingProviderName = new PersonName("Bill", "Foo", "Nye", "");

    // WHEN
    Organization org =
        _service.createOrganizationAndFacility(
            "Tim's org",
            "k12",
            "d6b3951b-6698-4ee7-9d63-aaadee85bac0",
            "Facility 1",
            "12345",
            getAddress(),
            "123-456-7890",
            "test@foo.com",
            List.of(getDeviceConfig().getInternalId()),
            orderingProviderName,
            getAddress(),
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
    assertNull(fac.getDefaultDeviceType());

    PatientSelfRegistrationLink orgLink =
        patientRegistrationLinkRepository.findByOrganization(org).get();
    PatientSelfRegistrationLink facLink =
        patientRegistrationLinkRepository.findByFacility(fac).get();
    assertEquals(5, orgLink.getLink().length());
    assertEquals(5, facLink.getLink().length());
  }

  private DeviceType getDeviceConfig() {
    return testDataFactory.createDeviceType("Abbott ID Now", "Abbott", "1");
  }

  @Test
  void createOrganizationAndFacility_orderingProviderRequired_failure() {
    // GIVEN
    PersonName orderProviderName = new PersonName("Bill", "Foo", "Nye", "");
    StreetAddress mockAddress = getAddress();
    List<UUID> deviceTypeIds = List.of(getDeviceConfig().getInternalId());

    // THEN
    assertThrows(
        OrderingProviderRequiredException.class,
        () ->
            _service.createOrganizationAndFacility(
                "Adam's org",
                "urgent_care",
                "d6b3951b-6698-4ee7-9d63-aaadee85bac0",
                "Facility 1",
                "12345",
                mockAddress,
                "123-456-7890",
                "test@foo.com",
                deviceTypeIds,
                orderProviderName,
                mockAddress,
                null,
                null));
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void getOrganizationsAndFacility_filterByIdentityVerified_success() {
    // GIVEN
    Organization verifiedOrg = testDataFactory.saveValidOrganization();
    Organization unverifiedOrg = testDataFactory.saveUnverifiedOrganization();

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
  @WithSimpleReportSiteAdminUser
  void getFacilitiesIncludeArchived_includeArchived_success() {
    Organization org = testDataFactory.saveValidOrganization();
    Facility deletedFacility = testDataFactory.createArchivedFacility(org, "Delete me");
    testDataFactory.createValidFacility(org, "Not deleted");

    Set<Facility> archivedFacilities = _service.getFacilitiesIncludeArchived(org, true);

    assertEquals(1, archivedFacilities.size());
    assertTrue(
        archivedFacilities.stream()
            .anyMatch(f -> f.getInternalId().equals(deletedFacility.getInternalId())));
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void getFacilitiesIncludeArchived_excludeArchived_success() {
    Organization org = testDataFactory.saveValidOrganization();
    testDataFactory.createArchivedFacility(org, "Delete me");
    Facility activeFacility = testDataFactory.createValidFacility(org, "Not deleted");

    Set<Facility> facilities = _service.getFacilitiesIncludeArchived(org, false);

    assertEquals(1, facilities.size());
    assertTrue(
        facilities.stream()
            .anyMatch(f -> f.getInternalId().equals(activeFacility.getInternalId())));
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void viewArchivedFacilities_success() {
    Organization org = testDataFactory.saveValidOrganization();
    Facility deletedFacility = testDataFactory.createArchivedFacility(org, "Delete me");

    Set<Facility> archivedFacilities = _service.getArchivedFacilities(org);

    assertTrue(
        archivedFacilities.stream()
            .anyMatch(f -> f.getInternalId().equals(deletedFacility.getInternalId())));
  }

  @Test
  @WithSimpleReportStandardUser
  void viewArchivedFacilities_standardUser_failure() {
    Organization org = testDataFactory.saveValidOrganization();
    testDataFactory.createArchivedFacility(org, "Delete me");

    assertThrows(AccessDeniedException.class, () -> _service.getArchivedFacilities());
  }

  @Test
  @DisplayName("it should allow global admins to mark facility as deleted")
  @WithSimpleReportSiteAdminUser
  void deleteFacilityTest_successful() {
    // GIVEN
    Organization verifiedOrg = testDataFactory.saveValidOrganization();
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
    UUID orgId = UUID.randomUUID();
    IllegalGraphqlArgumentException caught =
        assertThrows(
            IllegalGraphqlArgumentException.class,
            // fake UUID
            () -> _service.markFacilityAsDeleted(orgId, true));
    assertEquals("Facility not found.", caught.getMessage());
  }

  @Test
  @DisplayName("it should allow global admins to mark organizations as deleted")
  @WithSimpleReportSiteAdminUser
  void deleteOrganizationTest_successful() {
    // GIVEN
    Organization verifiedOrg = testDataFactory.saveValidOrganization();
    // WHEN
    Organization deletedOrganization =
        _service.markOrganizationAsDeleted(verifiedOrg.getInternalId(), true);
    // THEN
    assertThat(deletedOrganization.isDeleted()).isTrue();
  }

  @Test
  @DisplayName("it should not delete nonexistent organizations")
  @WithSimpleReportSiteAdminUser
  void deletedOrganizationTest_throwsErrorWhenOrganizationyNotFound() {
    UUID orgId = UUID.randomUUID();

    IllegalGraphqlArgumentException caught =
        assertThrows(
            IllegalGraphqlArgumentException.class,
            // fake UUID
            () -> _service.markOrganizationAsDeleted(orgId, true));
    assertEquals("Organization not found.", caught.getMessage());
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
    Organization org = testDataFactory.saveUnverifiedOrganization();
    _service.verifyOrganizationNoPermissions(org.getExternalId());

    org = _service.getOrganization(org.getExternalId());
    assertTrue(org.getIdentityVerified());
  }

  @Test
  void verifyOrganizationNoPermissions_orgAlreadyVerified_failure() {
    Organization org = testDataFactory.saveValidOrganization();
    String orgExternalId = org.getExternalId();
    IllegalStateException e =
        assertThrows(
            IllegalStateException.class,
            () -> _service.verifyOrganizationNoPermissions(orgExternalId));

    assertEquals("Organization is already verified.", e.getMessage());
  }

  @Test
  @WithSimpleReportStandardUser
  void getPermissibleOrgId_allowsAccessToCurrentOrg() {
    var actual = _service.getPermissibleOrgId(_service.getCurrentOrganization().getInternalId());
    assertEquals(actual, _service.getCurrentOrganization().getInternalId());
  }

  @Test
  @WithSimpleReportStandardUser
  void getPermissibleOrgId_nullIdFallsBackToCurrentOrg() {
    var actual = _service.getPermissibleOrgId(null);
    assertEquals(actual, _service.getCurrentOrganization().getInternalId());
  }

  @Test
  @WithSimpleReportStandardUser
  void getPermissibleOrgId_throwsAccessDeniedForInaccessibleOrg() {
    var inaccessibleOrgId = UUID.randomUUID();
    assertThrows(
        AccessDeniedException.class, () -> _service.getPermissibleOrgId(inaccessibleOrgId));
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void getFacilityStats_notAuthorizedError() {
    UUID facilityId = UUID.randomUUID();
    assertThrows(AccessDeniedException.class, () -> _service.getFacilityStats(facilityId));
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void getFacilityStats_argumentMissingError() {
    assertThrows(IllegalGraphqlArgumentException.class, () -> _service.getFacilityStats(null));
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void getFacilityStats_facilityNotFoundError() {
    UUID facilityId = UUID.randomUUID();
    doReturn(Optional.empty()).when(this.facilityRepository).findById(facilityId);
    assertThrows(IllegalGraphqlArgumentException.class, () -> _service.getFacilityStats(null));
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void getFacilityStats_success() {
    UUID facilityId = UUID.randomUUID();
    Facility mockFacility = mock(Facility.class);
    doReturn(Optional.of(mockFacility)).when(this.facilityRepository).findById(facilityId);
    doReturn(2).when(oktaRepository).getUsersInSingleFacility(mockFacility);
    doReturn(1).when(personRepository).countByFacilityAndIsDeleted(mockFacility, false);
    FacilityStats stats = _service.getFacilityStats(facilityId);
    assertEquals(2, stats.getUsersSingleAccessCount());
    assertEquals(1, stats.getPatientsSingleAccessCount());
  }

  @Nested
  @DisplayName("When updating a facility")
  class UpdateFacilityTest {
    private Facility facility;
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
      List<DeviceType> devices = deviceTypeRepository.findAll();

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
