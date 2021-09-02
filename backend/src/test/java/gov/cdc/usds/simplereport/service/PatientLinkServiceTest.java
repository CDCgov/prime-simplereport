package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import gov.cdc.usds.simplereport.api.model.errors.ExpiredPatientLinkException;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.api.pxp.CurrentPatientContextHolder;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.service.dataloader.PatientLinkDataLoader;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.function.BooleanSupplier;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.TestPropertySource;

@TestPropertySource(properties = "hibernate.query.interceptor.error-level=ERROR")
@SuppressWarnings("checkstyle:MagicNumber")
class PatientLinkServiceTest extends BaseServiceTest<PatientLinkService> {
  @Autowired private OrganizationService _organizationService;
  @Autowired private TestDataFactory _dataFactory;
  @MockBean private CurrentPatientContextHolder _contextHolder;

  private Organization _organization;
  private Facility _facility;
  private Person _person;
  private TestOrder _testOrder;
  private PatientLink _patientLink;

  @BeforeEach
  void setupData() {
    initSampleData();
    _organization = _organizationService.getCurrentOrganization();
    _facility = _dataFactory.createValidFacility(_organization);
    _person = _dataFactory.createFullPerson(_organization);
    _testOrder = _dataFactory.createTestOrder(_person, _facility);
    _patientLink = _dataFactory.createPatientLink(_testOrder);
  }

  @Test
  void getPatientLink() throws Exception {
    PatientLink result = _service.getPatientLink(_patientLink.getInternalId());
    assertEquals(result.getInternalId(), _patientLink.getInternalId());
    assertThrows(
        IllegalGraphqlArgumentException.class, () -> _service.getPatientLink(UUID.randomUUID()));
  }

  @Test
  void getPatientFromLink() throws Exception {
    Person result = _service.getPatientFromLink(_patientLink.getInternalId());
    assertEquals(result.getInternalId(), _person.getInternalId());
  }

  @Test
  void getRefreshedPatientLink() throws Exception {
    Date previousExpiry = _patientLink.getExpiresAt();
    PatientLink result = _service.getRefreshedPatientLink(_patientLink.getInternalId());
    assertTrue(result.getExpiresAt().after(previousExpiry));
  }

  @Test
  void verifyPatientLink() throws Exception {
    assertTrue(_service.verifyPatientLink(_patientLink.getInternalId(), _person.getBirthDate()));
    assertFalse(
        _service.verifyPatientLink(
            _patientLink.getInternalId(), _person.getBirthDate().plusDays(1)));
  }

  @Test
  void patientLinkLockout() throws Exception {
    BooleanSupplier failToVerify =
        () ->
            _service.verifyPatientLink(
                _patientLink.getInternalId(), _person.getBirthDate().plusDays(1));
    assertFalse(failToVerify.getAsBoolean());
    assertFalse(failToVerify.getAsBoolean());
    assertFalse(failToVerify.getAsBoolean());
    assertFalse(failToVerify.getAsBoolean());
    assertFalse(failToVerify.getAsBoolean());
    assertThrows(ExpiredPatientLinkException.class, () -> failToVerify.getAsBoolean());
  }

  @Test
  void patientLinkDataLoaderReturnsMostRecent() {
    List<PatientLink> links = new ArrayList<>();
    links.add(_patientLink);
    links.add(_dataFactory.createPatientLink(_testOrder));
    links.add(_dataFactory.createPatientLink(_testOrder));
    PatientLink mostRecent = _dataFactory.createPatientLink(_testOrder);
    links.add(mostRecent);
    assertEquals(mostRecent, PatientLinkDataLoader.getMostRecentPatientLink(links));
  }
}
