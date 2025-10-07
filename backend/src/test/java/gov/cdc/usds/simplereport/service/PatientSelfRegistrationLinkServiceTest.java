package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mockStatic;

import gov.cdc.usds.simplereport.api.model.errors.InvalidPatientSelfRegistrationLinkException;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientSelfRegistrationLink;
import gov.cdc.usds.simplereport.db.repository.PatientRegistrationLinkRepository;
import gov.cdc.usds.simplereport.test_util.DbTruncator;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportOrgAdminUser;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportSiteAdminUser;
import org.apache.commons.lang3.RandomStringUtils;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.TestPropertySource;

@TestPropertySource(properties = "hibernate.query.interceptor.error-level=ERROR")
class PatientSelfRegistrationLinkServiceTest
    extends BaseServiceTest<PatientSelfRegistrationLinkService> {

  @Autowired private DbTruncator _truncator;
  @Autowired private PatientSelfRegistrationLinkService _psrlService;
  @Autowired private PatientRegistrationLinkRepository _psrlRepo;

  private Organization _org;
  private Organization _unverifiedOrg;
  private Facility _fac;
  private Facility _unverifiedFac;
  private MockedStatic<RandomStringUtils> _rsl;

  private void truncateDb() {
    _truncator.truncateAll();
  }

  @BeforeEach
  void setupData() {
    _org = _dataFactory.saveValidOrganization();
    _fac = _dataFactory.createValidFacility(_org);
    _unverifiedOrg = _dataFactory.saveUnverifiedOrganization();
    _unverifiedFac = _dataFactory.createValidFacility(_unverifiedOrg);
  }

  @AfterEach
  public void cleanup() {
    truncateDb();
    if (_rsl != null) {
      _rsl.close();
    }
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void createRegistrationLink() {
    _psrlService.createRegistrationLink(_fac, "some-facility-link");
    PatientSelfRegistrationLink facLink =
        _psrlService.getPatientRegistrationLink("some-facility-link");
    assertEquals(_fac.getInternalId(), facLink.getFacility().getInternalId());
    _psrlService.createRegistrationLink(_org, "some-org-link");
    PatientSelfRegistrationLink link = _psrlService.getPatientRegistrationLink("some-org-link");
    assertEquals(_org.getInternalId(), link.getOrganization().getInternalId());
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void caseInsensitiveLinks() {
    _psrlService.createRegistrationLink(_fac, "some-facility-link");
    PatientSelfRegistrationLink facLink =
        _psrlService.getPatientRegistrationLink("some-FACILITY-link");
    assertEquals(_fac.getInternalId(), facLink.getFacility().getInternalId());
    _psrlService.createRegistrationLink(_org, "some-org-link");
    PatientSelfRegistrationLink link = _psrlService.getPatientRegistrationLink("some-ORG-link");
    assertEquals(_org.getInternalId(), link.getOrganization().getInternalId());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void createRegistrationLinkNotAllowed() throws AccessDeniedException {
    assertThrows(
        AccessDeniedException.class,
        () -> _psrlService.createRegistrationLink(_fac, "some-facility-link"));
    assertThrows(
        AccessDeniedException.class,
        () -> _psrlService.createRegistrationLink(_org, "some-org-link"));
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void updateRegistrationLink() {
    // update links
    _psrlService.createRegistrationLink(_fac, "some-facility-link");
    _psrlService.updateRegistrationLink("some-facility-link", "some-new-facility-link");
    PatientSelfRegistrationLink facLink =
        _psrlService.getPatientRegistrationLink("some-new-facility-link");
    assertEquals(_fac.getInternalId(), facLink.getFacility().getInternalId());
    _psrlService.createRegistrationLink(_org, "some-org-link");
    _psrlService.updateRegistrationLink("some-org-link", "some-new-org-link");
    PatientSelfRegistrationLink link = _psrlService.getPatientRegistrationLink("some-new-org-link");
    assertEquals(_org.getInternalId(), link.getOrganization().getInternalId());

    // soft-delete links
    _psrlService.updateRegistrationLink("some-new-facility-link", true);
    assertEquals(
        true, _psrlService.getPatientRegistrationLink("some-new-facility-link").isDeleted());
    _psrlService.updateRegistrationLink("some-new-org-link", true);
    assertEquals(true, _psrlService.getPatientRegistrationLink("some-new-org-link").isDeleted());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void updateRegistrationLinkNotAllowed() throws AccessDeniedException {
    PatientSelfRegistrationLink facLink =
        new PatientSelfRegistrationLink(_fac, "some-facility-link");
    PatientSelfRegistrationLink orgLink = new PatientSelfRegistrationLink(_org, "some-org-link");
    _psrlRepo.save(facLink);
    _psrlRepo.save(orgLink);

    assertThrows(
        AccessDeniedException.class,
        () -> _psrlService.updateRegistrationLink("some-facility-link", "some-new-facility-link"));
    assertThrows(
        AccessDeniedException.class,
        () -> _psrlService.updateRegistrationLink("some-org-link", "some-new-org-link"));
  }

  @Test
  void generatesOrgLink() {
    String link = _psrlService.createRegistrationLink(_org);
    assertEquals(5, _psrlService.getPatientRegistrationLink(link).getLink().length());
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void createDuplicateRegistrationLinkNotAllowed() throws DataIntegrityViolationException {
    _psrlService.createRegistrationLink(_org, "some-org-link");
    assertThrows(
        DataIntegrityViolationException.class,
        () -> _psrlService.createRegistrationLink(_org, "some-org-link"));
  }

  @Test
  void noOrgLinkAccessIfUnverified() {
    String orgLink = _psrlService.createRegistrationLink(_unverifiedOrg);

    assertThrows(
        InvalidPatientSelfRegistrationLinkException.class,
        () -> _psrlService.getPatientRegistrationLink(orgLink));
  }

  @Test
  void noFacilityLinkAccessIfUnverified() {
    String facLink = _psrlService.createRegistrationLink(_unverifiedFac);

    assertThrows(
        InvalidPatientSelfRegistrationLinkException.class,
        () -> _psrlService.getPatientRegistrationLink(facLink));
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void retryOnRandomOrgLinkCollision() {
    _psrlService.createRegistrationLink(_fac, "abcde");

    _rsl = mockStatic(RandomStringUtils.class);
    _rsl.when(
            () ->
                RandomStringUtils.random(
                    PatientSelfRegistrationLinkService.LINK_LENGTH,
                    PatientSelfRegistrationLinkService.LINK_CHARACTERS))
        .thenReturn("abcde")
        .thenReturn("uniqe");

    _psrlService.createRegistrationLink(_org);
    assertEquals("uniqe", _psrlRepo.findByOrganization(_org).get().getLink());
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void retryOnRandomFacilityLinkCollision() {
    _psrlService.createRegistrationLink(_org, "abcde");

    _rsl = mockStatic(RandomStringUtils.class);
    _rsl.when(
            () ->
                RandomStringUtils.random(
                    PatientSelfRegistrationLinkService.LINK_LENGTH,
                    PatientSelfRegistrationLinkService.LINK_CHARACTERS))
        .thenReturn("abcde")
        .thenReturn("uniqe");

    _psrlService.createRegistrationLink(_fac);
    assertEquals("uniqe", _psrlRepo.findByFacility(_fac).get().getLink());
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void tooManyRandomOrgLinkCollisionsFails() {
    _psrlService.createRegistrationLink(_fac, "abcde");

    _rsl = mockStatic(RandomStringUtils.class);
    _rsl.when(
            () ->
                RandomStringUtils.random(
                    PatientSelfRegistrationLinkService.LINK_LENGTH,
                    PatientSelfRegistrationLinkService.LINK_CHARACTERS))
        .thenReturn("abcde")
        .thenReturn("abcde")
        .thenReturn("uniqe");

    assertThrows(
        DataIntegrityViolationException.class, () -> _psrlService.createRegistrationLink(_org));
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void tooManyRandomFacilityLinkCollisionsFails() {
    _psrlService.createRegistrationLink(_org, "abcde");

    _rsl = mockStatic(RandomStringUtils.class);
    _rsl.when(
            () ->
                RandomStringUtils.random(
                    PatientSelfRegistrationLinkService.LINK_LENGTH,
                    PatientSelfRegistrationLinkService.LINK_CHARACTERS))
        .thenReturn("abcde")
        .thenReturn("abcde")
        .thenReturn("uniqe");

    assertThrows(
        DataIntegrityViolationException.class, () -> _psrlService.createRegistrationLink(_fac));
  }
}
