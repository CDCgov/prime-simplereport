package gov.cdc.usds.simplereport.service;

import static gov.cdc.usds.simplereport.test_util.TestDataBuilder.getAddress;
import static graphql.Assert.assertNull;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.api.model.FacilityStats;
import gov.cdc.usds.simplereport.api.model.Role;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.api.model.errors.OrderingProviderRequiredException;
import gov.cdc.usds.simplereport.config.FeatureFlagsConfig;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.FacilityLab;
import gov.cdc.usds.simplereport.db.model.IdentifiedEntity;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientSelfRegistrationLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.Specimen;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.db.repository.ApiUserRepository;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import gov.cdc.usds.simplereport.db.repository.FacilityLabRepository;
import gov.cdc.usds.simplereport.db.repository.FacilityRepository;
import gov.cdc.usds.simplereport.db.repository.OrganizationRepository;
import gov.cdc.usds.simplereport.db.repository.PatientRegistrationLinkRepository;
import gov.cdc.usds.simplereport.db.repository.PersonRepository;
import gov.cdc.usds.simplereport.db.repository.SpecimenRepository;
import gov.cdc.usds.simplereport.idp.repository.OktaRepository;
import gov.cdc.usds.simplereport.service.email.EmailService;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportOrgAdminUser;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportSiteAdminUser;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportStandardUser;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.access.AccessDeniedException;

@EnableAsync
class OrganizationServiceTest extends BaseServiceTest<OrganizationService> {

  @Autowired private PatientRegistrationLinkRepository patientRegistrationLinkRepository;
  @SpyBean private FacilityRepository facilityRepository;
  @SpyBean private FacilityLabRepository facilityLabRepository;
  @SpyBean private OrganizationRepository organizationRepository;
  @SpyBean private SpecimenRepository specimenRepository;
  @Autowired private DeviceTypeRepository deviceTypeRepository;
  @SpyBean private OktaRepository oktaRepository;
  @SpyBean private PersonRepository personRepository;
  @Autowired ApiUserRepository _apiUserRepo;
  @MockBean private EmailService emailService;
  @SpyBean private DbAuthorizationService dbAuthorizationService;
  @MockBean private FeatureFlagsConfig featureFlagsConfig;

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
    return _dataFactory.createDeviceType("Abbott ID Now", "Abbott", "1");
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
    Organization verifiedOrg = _dataFactory.saveValidOrganization();
    Organization unverifiedOrg = _dataFactory.saveUnverifiedOrganization();

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
    Organization org = _dataFactory.saveValidOrganization();
    Facility deletedFacility = _dataFactory.createArchivedFacility(org, "Delete me");
    _dataFactory.createValidFacility(org, "Not deleted");

    Set<Facility> archivedFacilities = _service.getFacilitiesIncludeArchived(org, true);

    assertEquals(1, archivedFacilities.size());
    assertTrue(
        archivedFacilities.stream()
            .anyMatch(f -> f.getInternalId().equals(deletedFacility.getInternalId())));
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void getFacilitiesIncludeArchived_excludeArchived_success() {
    Organization org = _dataFactory.saveValidOrganization();
    _dataFactory.createArchivedFacility(org, "Delete me");
    Facility activeFacility = _dataFactory.createValidFacility(org, "Not deleted");

    Set<Facility> facilities = _service.getFacilitiesIncludeArchived(org, false);

    assertEquals(1, facilities.size());
    assertTrue(
        facilities.stream()
            .anyMatch(f -> f.getInternalId().equals(activeFacility.getInternalId())));
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void viewArchivedFacilities_success() {
    Organization org = _dataFactory.saveValidOrganization();
    Facility deletedFacility = _dataFactory.createArchivedFacility(org, "Delete me");

    Set<Facility> archivedFacilities = _service.getArchivedFacilities(org);

    assertTrue(
        archivedFacilities.stream()
            .anyMatch(f -> f.getInternalId().equals(deletedFacility.getInternalId())));
  }

  @Test
  @WithSimpleReportStandardUser
  void viewArchivedFacilities_standardUser_failure() {
    Organization org = _dataFactory.saveValidOrganization();
    _dataFactory.createArchivedFacility(org, "Delete me");

    assertThrows(AccessDeniedException.class, () -> _service.getArchivedFacilities());
  }

  @Test
  @DisplayName("it should allow global admins to mark facility as deleted")
  @WithSimpleReportSiteAdminUser
  void deleteFacilityTest_successful() {
    // GIVEN
    Organization verifiedOrg = _dataFactory.saveValidOrganization();
    Facility mistakeFacility =
        _dataFactory.createValidFacility(verifiedOrg, "This facility is a mistake");
    // WHEN
    Facility deletedFacility =
        _service.markFacilityAsDeleted(mistakeFacility.getInternalId(), true);
    // THEN
    assertThat(deletedFacility.getIsDeleted()).isTrue();
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
    Organization verifiedOrg = _dataFactory.saveValidOrganization();
    // WHEN
    Organization deletedOrganization =
        _service.markOrganizationAsDeleted(verifiedOrg.getInternalId(), true);
    // THEN
    assertThat(deletedOrganization.getIsDeleted()).isTrue();
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
    assertSecurityError(() -> _service.updateOrganization("Foo org", "k12"));
  }

  @Test
  void verifyOrganizationNoPermissions_noUser_withOktaMigrationDisabled_success() {
    Organization org = _dataFactory.saveUnverifiedOrganization();
    _service.verifyOrganizationNoPermissions(org.getExternalId());

    org = _service.getOrganization(org.getExternalId());

    verify(dbAuthorizationService, times(0)).getOrgAdminUsers(org);
    verify(oktaRepository, times(1)).activateOrganizationWithSingleUser(org);
    assertTrue(org.getIdentityVerified());
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void verifyOrganizationNoPermissions_noUser_withOktaMigrationEnabled_throws() {
    when(featureFlagsConfig.isOktaMigrationEnabled()).thenReturn(true);
    Organization org = _dataFactory.saveUnverifiedOrganization();
    String orgExternalId = org.getExternalId();

    IllegalStateException e =
        assertThrows(
            IllegalStateException.class,
            () -> _service.verifyOrganizationNoPermissions(orgExternalId));
    assertEquals("Organization does not have any org admins.", e.getMessage());
    verify(dbAuthorizationService, times(1)).getOrgAdminUsers(org);
    verify(oktaRepository, times(0)).activateOrganizationWithSingleUser(org);
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void verifyOrganizationNoPermissions_withUsers_withOktaMigrationEnabled_success() {
    when(featureFlagsConfig.isOktaMigrationEnabled()).thenReturn(true);
    Organization org = _dataFactory.saveUnverifiedOrganizationWithUser("fake@example.com");

    _service.verifyOrganizationNoPermissions(org.getExternalId());
    verify(dbAuthorizationService, times(1)).getOrgAdminUsers(org);
    verify(oktaRepository, times(1)).activateUser("fake@example.com");
    verify(oktaRepository, times(0)).activateOrganizationWithSingleUser(org);

    org = _service.getOrganization(org.getExternalId());
    assertTrue(org.getIdentityVerified());
  }

  @Test
  void verifyOrganizationNoPermissions_orgAlreadyVerified_failure() {
    Organization org = _dataFactory.saveValidOrganization();
    String orgExternalId = org.getExternalId();
    IllegalStateException e =
        assertThrows(
            IllegalStateException.class,
            () -> _service.verifyOrganizationNoPermissions(orgExternalId));

    assertEquals("Organization is already verified.", e.getMessage());
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void setIdentityVerified_withOktaMigrationDisabled_success() {
    when(featureFlagsConfig.isOktaMigrationEnabled()).thenReturn(false);
    Organization unverifiedOrg = _dataFactory.saveUnverifiedOrganization();

    boolean status = _service.setIdentityVerified(unverifiedOrg.getExternalId(), true);
    verify(dbAuthorizationService, times(0)).getOrgAdminUsers(unverifiedOrg);
    verify(oktaRepository, times(1)).activateOrganization(unverifiedOrg);
    assertTrue(status);
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void setIdentityVerified_withOktaMigrationEnabled_success() {
    when(featureFlagsConfig.isOktaMigrationEnabled()).thenReturn(true);
    Organization unverifiedOrg =
        _dataFactory.saveUnverifiedOrganizationWithUser("fake@example.com");

    boolean status = _service.setIdentityVerified(unverifiedOrg.getExternalId(), true);
    verify(dbAuthorizationService, times(1)).getOrgAdminUsers(unverifiedOrg);
    verify(oktaRepository, times(0)).activateOrganization(unverifiedOrg);
    assertTrue(status);
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
  void getFacilityStats_withOktaMigrationDisabled_success() {
    UUID facilityId = UUID.randomUUID();
    Facility mockFacility = mock(Facility.class);
    doReturn(Optional.of(mockFacility)).when(this.facilityRepository).findById(facilityId);
    doReturn(2).when(oktaRepository).getUsersCountInSingleFacility(mockFacility);
    doReturn(1).when(personRepository).countByFacilityAndIsDeleted(mockFacility, false);
    FacilityStats stats = _service.getFacilityStats(facilityId);

    verify(dbAuthorizationService, times(0)).getUsersWithSingleFacilityAccessCount(mockFacility);
    assertEquals(2, stats.getUsersSingleAccessCount());
    assertEquals(1, stats.getPatientsSingleAccessCount());
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void getFacilityStats_withOktaMigrationEnabled_success() {
    when(featureFlagsConfig.isOktaMigrationEnabled()).thenReturn(true);
    UUID facilityId = UUID.randomUUID();
    Facility mockFacility = mock(Facility.class);
    doReturn(Optional.of(mockFacility)).when(this.facilityRepository).findById(facilityId);
    doReturn(4).when(dbAuthorizationService).getUsersWithSingleFacilityAccessCount(mockFacility);
    doReturn(2).when(personRepository).countByFacilityAndIsDeleted(mockFacility, false);
    FacilityStats stats = _service.getFacilityStats(facilityId);

    verify(oktaRepository, times(0)).getUsersCountInSingleFacility(mockFacility);
    assertEquals(4, stats.getUsersSingleAccessCount());
    assertEquals(2, stats.getPatientsSingleAccessCount());
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

  @Test
  @WithSimpleReportSiteAdminUser
  void getOrgAdminUserIds_success() {
    Organization createdOrg = _dataFactory.saveValidOrganization();
    List<String> adminUserEmails = oktaRepository.fetchAdminUserEmail(createdOrg);

    List<UUID> expectedIds =
        adminUserEmails.stream()
            .map(email -> _apiUserRepo.findByLoginEmail(email).get().getInternalId())
            .collect(Collectors.toList());

    List<UUID> adminIds = _service.getOrgAdminUserIds(createdOrg.getInternalId());
    assertThat(adminIds).isEqualTo(expectedIds);
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void getOrgAdminUserIds_returnsEmptyList_forNonExistentOrg() {
    UUID mismatchedUUID = UUID.fromString("5ebf893a-bb57-48ca-8fc2-1ef6b25e465b");
    List<UUID> adminIds = _service.getOrgAdminUserIds(mismatchedUUID);
    assertThat(adminIds).isEmpty();
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void getOrgAdminUserIds_skipsUser_forNonExistentUserInOrg() {
    Organization createdOrg = _dataFactory.saveValidOrganization();
    List<String> listWithAnExtraEmail = oktaRepository.fetchAdminUserEmail(createdOrg);
    listWithAnExtraEmail.add("nonexistent@example.com");

    when(oktaRepository.fetchAdminUserEmail(createdOrg)).thenReturn(listWithAnExtraEmail);
    List<UUID> expectedIds =
        listWithAnExtraEmail.stream()
            .filter(email -> !email.equals("nonexistent@example.com"))
            .map(email -> _apiUserRepo.findByLoginEmail(email).get().getInternalId())
            .collect(Collectors.toList());

    List<UUID> adminIds = _service.getOrgAdminUserIds(createdOrg.getInternalId());
    assertThat(adminIds).isEqualTo(expectedIds);
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void deleteE2EOktaOrganization_succeeds() {
    Organization createdOrg = _dataFactory.saveValidOrganization();
    Organization deletedOrg = _service.deleteE2EOktaOrganization(createdOrg.getExternalId());

    assertThat(deletedOrg).isEqualTo(createdOrg);
    verify(oktaRepository, times(1)).deleteOrganization(createdOrg);
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void getFacilityLabs_shouldReturnAllNonDeletedFacilityLabs() {
    UUID facilityId = UUID.randomUUID();

    FacilityLab expectedLab1 =
        FacilityLab.builder()
            .facilityId(facilityId)
            .labId(UUID.randomUUID())
            .name("name1")
            .description("description1")
            .build();

    FacilityLab expectedLab2 =
        FacilityLab.builder()
            .facilityId(facilityId)
            .labId(UUID.randomUUID())
            .name("name2")
            .description("description2")
            .build();

    List<FacilityLab> expectedLabs = Arrays.asList(expectedLab1, expectedLab2);

    when(facilityLabRepository.findAllByFacilityIdAndIsDeletedFalse(facilityId))
        .thenReturn(expectedLabs);
    List<FacilityLab> result = _service.getFacilityLabs(facilityId);

    assertThat(result).hasSize(2);
    assertThat(result).isEqualTo(expectedLabs);
    verify(facilityLabRepository).findAllByFacilityIdAndIsDeletedFalse(facilityId);
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void createFacilityLab_shouldCreateNewFacilityLab_whenNoneExists() {
    // Given
    UUID facilityId = UUID.randomUUID();
    UUID labId = UUID.randomUUID();
    String name = "Test Lab";
    String description = "Test Description";

    FacilityLab expectedLab =
        FacilityLab.builder()
            .facilityId(facilityId)
            .labId(labId)
            .name(name)
            .description(description)
            .build();

    expectedLab.setIsDeleted(true);
    when(facilityLabRepository.findDistinctFirstByFacilityIdAndLabIdAndIsDeletedTrue(
            facilityId, labId))
        .thenReturn(Optional.of(expectedLab));
    doReturn(expectedLab).when(facilityLabRepository).save(any());

    // When
    FacilityLab result = _service.createFacilityLab(facilityId, labId, name, description);

    // Then
    assertThat(result).isNotNull();
    assertThat(result.getFacilityId()).isEqualTo(facilityId);
    assertThat(result.getLabId()).isEqualTo(labId);
    assertThat(result.getName()).isEqualTo(name);
    assertThat(result.getDescription()).isEqualTo(description);
    verify(facilityLabRepository).save(any(FacilityLab.class));
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void createFacilityLab_shouldRestoreDeletedFacilityLab_whenDeletedOneExists() {
    // Given
    UUID facilityId = UUID.randomUUID();
    UUID labId = UUID.randomUUID();
    String name = "Updated Lab";
    String description = "Updated Description";

    FacilityLab deletedLab =
        FacilityLab.builder()
            .facilityId(facilityId)
            .labId(labId)
            .name(name)
            .description(description)
            .build();

    deletedLab.setIsDeleted(true);
    deletedLab.setName("Old Name");
    deletedLab.setDescription("Old Description");

    when(facilityLabRepository.findDistinctFirstByFacilityIdAndLabIdAndIsDeletedTrue(
            facilityId, labId))
        .thenReturn(Optional.of(deletedLab));
    doReturn(deletedLab).when(facilityLabRepository).save(any());

    // When
    FacilityLab result = _service.createFacilityLab(facilityId, labId, name, description);

    // Then
    assertThat(result.getName()).isEqualTo(name);
    assertThat(result.getDescription()).isEqualTo(description);
    assertThat(result.getIsDeleted()).isFalse();
    verify(facilityLabRepository).save(deletedLab);
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void updateFacilityLab_shouldUpdateExistingFacilityLab() {
    // Given
    UUID facilityId = UUID.randomUUID();
    UUID labId = UUID.randomUUID();
    String newName = "Updated Lab";
    String newDescription = "Updated Description";

    FacilityLab existingLab =
        FacilityLab.builder()
            .facilityId(facilityId)
            .labId(labId)
            .name("Old Name")
            .description("Old Description")
            .build();

    when(facilityLabRepository.findDistinctFirstByFacilityIdAndLabIdAndIsDeletedFalse(
            facilityId, labId))
        .thenReturn(Optional.of(existingLab));
    doReturn(existingLab).when(facilityLabRepository).save(any());

    // When
    FacilityLab result =
        _service.updateFacilityLab(
            facilityId, labId, Optional.of(newName), Optional.of(newDescription));

    // Then
    assertThat(result.getName()).isEqualTo(newName);
    assertThat(result.getDescription()).isEqualTo(newDescription);
    assertThat(result.getLabId()).isEqualTo(labId);
    verify(facilityLabRepository).save(existingLab);
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void updateFacilityLab_shouldThrowException_whenFacilityLabNotFound() {
    UUID facilityId = UUID.randomUUID();
    UUID labId = UUID.randomUUID();

    when(facilityLabRepository.findDistinctFirstByFacilityIdAndLabIdAndIsDeletedFalse(
            facilityId, labId))
        .thenReturn(Optional.empty());

    assertThrows(
        IllegalArgumentException.class,
        () ->
            _service.updateFacilityLab(
                facilityId, labId, Optional.of("name"), Optional.of("description")));
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void markFacilityLabAsDeleted_shouldDeleteFacilityLab_whenExists() {
    UUID facilityId = UUID.randomUUID();
    UUID labId = UUID.randomUUID();

    FacilityLab existingLab =
        FacilityLab.builder()
            .facilityId(facilityId)
            .labId(labId)
            .name("Old Name")
            .description("Old Description")
            .build();

    when(facilityLabRepository.findDistinctFirstByFacilityIdAndLabIdAndIsDeletedFalse(
            facilityId, labId))
        .thenReturn(Optional.of(existingLab));
    doNothing().when(facilityLabRepository).delete(any());

    boolean result = _service.markFacilityLabAsDeleted(facilityId, labId);
    assertThat(result).isTrue();
    verify(facilityLabRepository).delete(existingLab);
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void markFacilityLabAsDeleted_shouldThrowException_whenFacilityLabNotFound() {
    UUID facilityId = UUID.randomUUID();
    UUID labId = UUID.randomUUID();

    when(facilityLabRepository.findDistinctFirstByFacilityIdAndLabIdAndIsDeletedFalse(
            facilityId, labId))
        .thenReturn(Optional.empty());

    assertThrows(
        IllegalArgumentException.class, () -> _service.markFacilityLabAsDeleted(facilityId, labId));
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void addFacilityLabSpecimen_shouldAddSpecimen_whenBothExist() {
    UUID facilityId = UUID.randomUUID();
    UUID labId = UUID.randomUUID();
    UUID specimenId = UUID.randomUUID();

    FacilityLab facilityLab =
        FacilityLab.builder()
            .facilityId(facilityId)
            .labId(labId)
            .name("name")
            .description("description")
            .specimens(new HashSet<>())
            .build();

    Specimen specimen = createMockSpecimen(specimenId);

    when(facilityLabRepository.findDistinctFirstByFacilityIdAndLabIdAndIsDeletedFalse(
            facilityId, labId))
        .thenReturn(Optional.of(facilityLab));
    when(specimenRepository.findById(specimenId)).thenReturn(Optional.of(specimen));
    Set<Specimen> result = _service.addFacilityLabSpecimen(facilityId, labId, specimenId);

    assertThat(result).hasSize(1);
    assertThat(result).contains(specimen);
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void addFacilityLabSpecimen_shouldThrowException_whenFacilityLabNotFound() {
    UUID facilityId = UUID.randomUUID();
    UUID labId = UUID.randomUUID();
    UUID specimenId = UUID.randomUUID();

    when(facilityLabRepository.findDistinctFirstByFacilityIdAndLabIdAndIsDeletedFalse(
            facilityId, labId))
        .thenReturn(Optional.empty());

    assertThrows(
        IllegalArgumentException.class,
        () -> _service.addFacilityLabSpecimen(facilityId, labId, specimenId));
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void addFacilityLabSpecimen_shouldThrowException_whenSpecimenNotFound() {
    UUID facilityId = UUID.randomUUID();
    UUID labId = UUID.randomUUID();
    UUID specimenId = UUID.randomUUID();

    FacilityLab facilityLab =
        FacilityLab.builder()
            .facilityId(facilityId)
            .labId(labId)
            .name("name")
            .description("description")
            .build();

    when(facilityLabRepository.findDistinctFirstByFacilityIdAndLabIdAndIsDeletedFalse(
            facilityId, labId))
        .thenReturn(Optional.of(facilityLab));
    when(specimenRepository.findById(specimenId)).thenReturn(Optional.empty());

    assertThrows(
        IllegalArgumentException.class,
        () -> _service.addFacilityLabSpecimen(facilityId, labId, specimenId));
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void deleteFacilityLabSpecimen_shouldRemoveSpecimen_whenBothExist() {
    UUID facilityId = UUID.randomUUID();
    UUID labId = UUID.randomUUID();
    UUID specimenId = UUID.randomUUID();

    FacilityLab facilityLab = createMockFacilityLab(facilityId, labId);
    Specimen specimen = createMockSpecimen(specimenId);

    when(facilityLabRepository.findDistinctFirstByFacilityIdAndLabIdAndIsDeletedFalse(
            facilityId, labId))
        .thenReturn(Optional.of(facilityLab));
    when(specimenRepository.findById(specimenId)).thenReturn(Optional.of(specimen));
    when(facilityLab.removeSpecimen(specimen)).thenReturn(true);

    boolean result = _service.deleteFacilityLabSpecimen(facilityId, labId, specimenId);

    assertThat(result).isTrue();
    verify(facilityLab).removeSpecimen(specimen);
    verify(facilityLabRepository).save(facilityLab);
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void deleteFacilityLabSpecimen_shouldReturnFalse_whenFacilityLabNotFound() {
    UUID facilityId = UUID.randomUUID();
    UUID labId = UUID.randomUUID();
    UUID specimenId = UUID.randomUUID();

    when(facilityLabRepository.findDistinctFirstByFacilityIdAndLabIdAndIsDeletedFalse(
            facilityId, labId))
        .thenReturn(Optional.empty());

    boolean result = _service.deleteFacilityLabSpecimen(facilityId, labId, specimenId);

    assertThat(result).isFalse();
    verify(facilityLabRepository, never()).save(any());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void deleteFacilityLabSpecimen_shouldReturnFalse_whenSpecimenNotFound() {
    UUID facilityId = UUID.randomUUID();
    UUID labId = UUID.randomUUID();
    UUID specimenId = UUID.randomUUID();

    FacilityLab facilityLab =
        FacilityLab.builder()
            .facilityId(facilityId)
            .labId(labId)
            .name("name")
            .description("description")
            .build();

    when(facilityLabRepository.findDistinctFirstByFacilityIdAndLabIdAndIsDeletedFalse(
            facilityId, labId))
        .thenReturn(Optional.of(facilityLab));
    when(specimenRepository.findById(specimenId)).thenReturn(Optional.empty());

    boolean result = _service.deleteFacilityLabSpecimen(facilityId, labId, specimenId);

    assertThat(result).isFalse();
    verify(facilityLabRepository, never()).save(any());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void deleteFacilityLabSpecimen_shouldReturnFalse_whenSpecimenNotRemovedFromLab() {
    UUID facilityId = UUID.randomUUID();
    UUID labId = UUID.randomUUID();
    UUID specimenId = UUID.randomUUID();

    FacilityLab facilityLab = createMockFacilityLab(facilityId, labId);
    Specimen specimen = createMockSpecimen(specimenId);

    when(facilityLabRepository.findDistinctFirstByFacilityIdAndLabIdAndIsDeletedFalse(
            facilityId, labId))
        .thenReturn(Optional.of(facilityLab));
    when(specimenRepository.findById(specimenId)).thenReturn(Optional.of(specimen));
    when(facilityLab.removeSpecimen(specimen)).thenReturn(false);

    boolean result = _service.deleteFacilityLabSpecimen(facilityId, labId, specimenId);

    assertThat(result).isFalse();
    verify(facilityLabRepository, never()).save(any());
  }

  @Nested
  @DisplayName("Sending org admin email CSV")
  class SendOrgAdminEmailCSVTest {
    @BeforeEach
    void setupOrgs() {
      when(oktaRepository.getOktaRateLimitSleepMs()).thenReturn(0);
      when(oktaRepository.getOktaOrgsLimit()).thenReturn(1);
    }

    private void sendOrgAdminEmailCSVAsync_mnFacilities_test(
        Map<String, List<String>> expectedMnFacilityOrgEmails)
        throws ExecutionException, InterruptedException {
      String type = "facilities";
      String state = "MN";
      String mnExternalId = expectedMnFacilityOrgEmails.keySet().stream().findFirst().get();
      UUID mnId = organizationRepository.findByExternalId(mnExternalId).get().getInternalId();
      List<String> mnEmails = _service.sendOrgAdminEmailCSVAsync(List.of(mnId), type, state).get();
      List<String> expectedEmails = expectedMnFacilityOrgEmails.get(mnExternalId);
      verify(emailService, times(1)).sendWithCSVAttachment(expectedEmails, state, type);
      assertThat(mnEmails).isEqualTo(expectedEmails);
    }

    private void sendOrgAdminEmailCSVAsync_paFacilities_test()
        throws ExecutionException, InterruptedException {
      String type = "facilities";
      String state = "PA";
      List<String> nonExistentOrgEmails =
          _service.sendOrgAdminEmailCSVAsync(List.of(), type, state).get();
      verify(emailService, times(1)).sendWithCSVAttachment(nonExistentOrgEmails, state, type);
      assertThat(nonExistentOrgEmails).isEmpty();
    }

    private void sendOrgAdminEmailCSVAsync_njPatients_test(List<String> expectedNJPatientsOrgEmails)
        throws ExecutionException, InterruptedException {
      String type = "patients";
      String state = "NJ";
      List<UUID> orgsWithNJPatientTestEvents =
          organizationRepository.findAllByPatientStateWithTestEvents(state).stream()
              .map(IdentifiedEntity::getInternalId)
              .toList();
      List<String> njPatientsOrgEmails =
          _service.sendOrgAdminEmailCSVAsync(orgsWithNJPatientTestEvents, type, state).get();
      verify(emailService, times(1)).sendWithCSVAttachment(njPatientsOrgEmails, state, type);
      assertThat(njPatientsOrgEmails).isEqualTo(expectedNJPatientsOrgEmails);
    }

    @Test
    @WithSimpleReportSiteAdminUser
    void sendOrgAdminEmailCSVAsync_withEmailsByFacility_withOktaMigrationDisabled_success()
        throws ExecutionException, InterruptedException {
      when(featureFlagsConfig.isOktaMigrationEnabled()).thenReturn(false);
      Map<String, List<String>> orgEmailsByFacility = setupFacilitiesAndReturnMNFacOrgEmails();
      sendOrgAdminEmailCSVAsync_mnFacilities_test(orgEmailsByFacility);
    }

    @Test
    @WithSimpleReportSiteAdminUser
    void sendOrgAdminEmailCSVAsync_withEmailsByFacility_withOktaMigrationEnabled_success()
        throws ExecutionException, InterruptedException {
      when(featureFlagsConfig.isOktaMigrationEnabled()).thenReturn(true);
      Map<String, List<String>> orgEmailsByFacility = setupFacilitiesAndReturnMNFacOrgEmails();
      sendOrgAdminEmailCSVAsync_mnFacilities_test(orgEmailsByFacility);
    }

    @Test
    @WithSimpleReportSiteAdminUser
    void sendOrgAdminEmailCSVAsync_withNoEmailsByFacility_withOktaMigrationDisabled_success()
        throws ExecutionException, InterruptedException {
      when(featureFlagsConfig.isOktaMigrationEnabled()).thenReturn(false);
      sendOrgAdminEmailCSVAsync_paFacilities_test();
    }

    @Test
    @WithSimpleReportSiteAdminUser
    void sendOrgAdminEmailCSVAsync_withNoEmailsByFacility_withOktaMigrationEnabled_success()
        throws ExecutionException, InterruptedException {
      when(featureFlagsConfig.isOktaMigrationEnabled()).thenReturn(true);
      sendOrgAdminEmailCSVAsync_paFacilities_test();
    }

    @Test
    @WithSimpleReportSiteAdminUser
    void sendOrgAdminEmailCSVAsync_withEmailsByPatient_withOktaMigrationDisabled_success()
        throws ExecutionException, InterruptedException {
      when(featureFlagsConfig.isOktaMigrationEnabled()).thenReturn(false);
      List<String> njPatientOrgAdminEmails = setupPatientsAndReturnNJPatientsOrgEmails();
      sendOrgAdminEmailCSVAsync_njPatients_test(njPatientOrgAdminEmails);
    }

    @Test
    @WithSimpleReportSiteAdminUser
    void sendOrgAdminEmailCSVAsync_withEmailsByPatient_withOktaMigrationEnabled_success()
        throws ExecutionException, InterruptedException {
      List<String> njPatientOrgAdminEmails = setupPatientsAndReturnNJPatientsOrgEmails();
      sendOrgAdminEmailCSVAsync_njPatients_test(njPatientOrgAdminEmails);
    }

    @Test
    @WithSimpleReportStandardUser
    void sendOrgAdminEmailCSV_accessDeniedException() {
      assertThrows(
          AccessDeniedException.class,
          () -> {
            _service.sendOrgAdminEmailCSV("facilities", "NM");
          });
    }

    @Test
    @WithSimpleReportSiteAdminUser
    void sendOrgAdminEmailCSV_byFacilities_success() {
      boolean mnEmailSent = _service.sendOrgAdminEmailCSV("facilities", "MN");
      verify(facilityRepository, times(1)).findByFacilityState("MN");
      assertThat(mnEmailSent).isTrue();

      boolean njEmailSent = _service.sendOrgAdminEmailCSV("faCilities", "NJ");
      verify(facilityRepository, times(1)).findByFacilityState("NJ");
      assertThat(njEmailSent).isTrue();
    }

    @Test
    @WithSimpleReportSiteAdminUser
    void sendOrgAdminEmailCSV_byPatients_success() {
      boolean caEmailSent = _service.sendOrgAdminEmailCSV("patients", "CA");
      verify(organizationRepository, times(1)).findAllByPatientStateWithTestEvents("CA");
      assertThat(caEmailSent).isTrue();

      boolean njEmailSent = _service.sendOrgAdminEmailCSV("PATIENTS", "NJ");
      verify(organizationRepository, times(1)).findAllByPatientStateWithTestEvents("NJ");
      assertThat(njEmailSent).isTrue();
    }

    @Test
    @WithSimpleReportSiteAdminUser
    void sendOrgAdminEmailCSV_byUnsupportedType_success() {
      boolean unsupportedTypeEmailSent = _service.sendOrgAdminEmailCSV("Unsupported", "CA");
      verify(organizationRepository, times(0)).findAllByPatientStateWithTestEvents("CA");
      verify(facilityRepository, times(0)).findByFacilityState("CA");
      assertThat(unsupportedTypeEmailSent).isTrue();
    }
  }

  private Map<String, List<String>> setupFacilitiesAndReturnMNFacOrgEmails() {
    StreetAddress orgAStreetAddress =
        new StreetAddress("123 Main Street", null, "Hackensack", "NJ", "07601", "Bergen");
    String njOrgUUID = UUID.randomUUID().toString();
    String njOrgEmail = njOrgUUID + "@example.com";
    Organization orgA =
        _dataFactory.saveOrganization(new Organization(njOrgUUID, "k12", njOrgUUID, true));
    _dataFactory.createValidFacility(orgA, "Org A Facility 1", orgAStreetAddress);
    _dataFactory.createValidFacility(orgA, "Org A Facility 2", orgAStreetAddress);
    _dataFactory.createValidApiUser(njOrgEmail, orgA, Role.ADMIN);

    String mnOrgUUID = UUID.randomUUID().toString();
    String mnOrgEmail1 = mnOrgUUID + "1@example.com";
    String mnOrgEmail2 = mnOrgUUID + "2@example.com";

    StreetAddress orgBStreetAddress =
        new StreetAddress("234 Red Street", null, "Minneapolis", "MN", "55407", "Hennepin");
    Organization orgB =
        _dataFactory.saveOrganization(new Organization(mnOrgUUID, "airport", mnOrgUUID, true));
    _dataFactory.createValidFacility(orgB, "Org B Facility 1", orgBStreetAddress);
    _dataFactory.createValidApiUser(mnOrgUUID + "1@example.com", orgB, Role.ADMIN);
    _dataFactory.createValidApiUser(mnOrgUUID + "2@example.com", orgB, Role.ADMIN);

    Map<String, List<String>> mnEmails = new HashMap<>();
    mnEmails.put(mnOrgUUID, List.of(mnOrgEmail1, mnOrgEmail2));

    return mnEmails;
  }

  private List<String> setupPatientsAndReturnNJPatientsOrgEmails() {
    String orgAUUID = UUID.randomUUID().toString();
    String orgAEmail = orgAUUID + "@example.com";
    StreetAddress njStreetAddress =
        new StreetAddress("123 Main Street", null, "Hackensack", "NJ", "07601", "Bergen");
    StreetAddress caStreetAddress =
        new StreetAddress("456 Red Street", null, "Sunnyvale", "CA", "94086", "Santa Clara");
    StreetAddress mnStreetAddress =
        new StreetAddress("234 Red Street", null, "Minneapolis", "MN", "55407", "Hennepin");
    Organization orgA =
        _dataFactory.saveOrganization(new Organization(orgAUUID, "k12", orgAUUID, true));
    _dataFactory.createValidApiUser(orgAEmail, orgA, Role.ADMIN);
    Facility orgAFacility =
        _dataFactory.createValidFacility(orgA, "Org A Facility 1", njStreetAddress);

    // create patient in NJ with a test event for Org A
    Person orgAPatient1 =
        _dataFactory.createFullPersonWithAddress(orgA, njStreetAddress, "Joe", "Moe");
    _dataFactory.createTestEvent(orgAPatient1, orgAFacility, TestResult.POSITIVE);

    String orgBUUID = UUID.randomUUID().toString();
    String orgBEmail1 = orgBUUID + "1@example.com";
    String orgBEmail2 = orgBUUID + "2@example.com";
    Organization orgB =
        _dataFactory.saveOrganization(new Organization(orgBUUID, "airport", orgBUUID, true));
    _dataFactory.createValidApiUser(orgBEmail1, orgB, Role.ADMIN);
    _dataFactory.createValidApiUser(
        orgBEmail2, orgB, Role.USER); // should not be returned since not an admin
    Facility orgBFacility =
        _dataFactory.createValidFacility(orgB, "Org B Facility 1", mnStreetAddress);
    // create patient in CA with a test event for Org A
    Person orgAPatient2 =
        _dataFactory.createFullPersonWithAddress(orgA, caStreetAddress, "Ed", "Eaves");
    _dataFactory.createTestEvent(orgAPatient2, orgBFacility, TestResult.UNDETERMINED);
    // create patient in NJ with a test event for Org B
    Person orgBPatient1 =
        _dataFactory.createFullPersonWithAddress(orgB, njStreetAddress, "Mary", "Meade");
    _dataFactory.createTestEvent(orgBPatient1, orgBFacility, TestResult.NEGATIVE);

    return Stream.of(orgAEmail, orgBEmail1).sorted().collect(Collectors.toList());
  }

  private FacilityLab createMockFacilityLab(UUID facilityId, UUID labId) {
    FacilityLab facilityLab = mock(FacilityLab.class);
    when(facilityLab.getFacilityId()).thenReturn(facilityId);
    when(facilityLab.getLabId()).thenReturn(labId);
    when(facilityLab.getIsDeleted()).thenReturn(false);
    return facilityLab;
  }

  private Specimen createMockSpecimen(UUID specimenId) {
    Specimen specimen = mock(Specimen.class);
    when(specimen.getInternalId()).thenReturn(specimenId);
    return specimen;
  }
}
