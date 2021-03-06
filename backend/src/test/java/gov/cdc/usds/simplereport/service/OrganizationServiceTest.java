package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import gov.cdc.usds.simplereport.api.model.errors.OrderingProviderRequiredException;
import gov.cdc.usds.simplereport.db.model.DeviceSpecimenType;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientSelfRegistrationLink;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.repository.PatientRegistrationLinkRepository;
import gov.cdc.usds.simplereport.service.model.DeviceSpecimenTypeHolder;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportOrgAdminUser;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportSiteAdminUser;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;

class OrganizationServiceTest extends BaseServiceTest<OrganizationService> {

  @Autowired private TestDataFactory _dataFactory;
  @Autowired private PatientRegistrationLinkRepository _prlRepo;

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
  void createOrganization_standardUser_error() {
    DeviceSpecimenTypeHolder holder = getDeviceConfig();
    PersonName bill = new PersonName("Bill", "Foo", "Nye", "");
    Organization org =
        _service.createOrganization(
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
  void createOrganization_adminUser_success() {
    DeviceSpecimenTypeHolder holder = getDeviceConfig();
    PersonName bill = new PersonName("Bill", "Foo", "Nye", "");
    Organization org =
        _service.createOrganization(
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
  void createOrganization_orderingProviderRequired_failure() {
    DeviceSpecimenTypeHolder holder = getDeviceConfig();
    PersonName bill = new PersonName("Bill", "Foo", "Nye", "");
    assertThrows(
        OrderingProviderRequiredException.class,
        () -> {
          _service.createOrganization(
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
  void getOrganizations_filterByIdentityVerified_success() {
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
  @WithSimpleReportOrgAdminUser
  void adminUpdateOrganization_not_allowed() {
    AccessDeniedException caught =
        assertThrows(
            AccessDeniedException.class, () -> _service.updateOrganization("Foo org", "k12"));
    assertEquals("Access is denied", caught.getMessage());
  }
}
