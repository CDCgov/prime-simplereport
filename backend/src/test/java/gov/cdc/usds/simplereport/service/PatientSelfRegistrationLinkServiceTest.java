package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientSelfRegistrationLink;
import gov.cdc.usds.simplereport.db.repository.PatientRegistrationLinkRepository;
import gov.cdc.usds.simplereport.test_util.DbTruncator;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportOrgAdminUser;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportSiteAdminUser;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;

class PatientSelfRegistrationLinkServiceTest
    extends BaseServiceTest<PatientSelfRegistrationLinkService> {

  @Autowired private DbTruncator _truncator;
  @Autowired private PatientSelfRegistrationLinkService _psrlService;
  @Autowired private PatientRegistrationLinkRepository _psrlRepo;

  private Organization _org;
  private Facility _fac;

  private void truncateDb() {
    _truncator.truncateAll();
  }

  @BeforeEach
  void setupData() {
    _org = _dataFactory.createValidOrg();
    _fac = _dataFactory.createValidFacility(_org);
  }

  @AfterEach
  public void cleanup() {
    truncateDb();
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
        _psrlService.getPatientRegistrationLink("some-facility-link");
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
}
