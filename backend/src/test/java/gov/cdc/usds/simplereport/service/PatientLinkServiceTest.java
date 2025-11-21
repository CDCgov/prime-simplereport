package gov.cdc.usds.simplereport.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;

import gov.cdc.usds.simplereport.api.model.errors.ExpiredPatientLinkException;
import gov.cdc.usds.simplereport.api.model.errors.InvalidPatientLinkException;
import gov.cdc.usds.simplereport.api.pxp.CurrentPatientContextHolder;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.repository.PatientLinkRepository;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.time.LocalDate;
import java.util.Date;
import java.util.UUID;
import java.util.function.BooleanSupplier;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SuppressWarnings("checkstyle:MagicNumber")
class PatientLinkServiceTest extends BaseServiceTest<PatientLinkService> {
  @Autowired private PatientLinkRepository patientLinkRepository;
  @Autowired private OrganizationService _organizationService;
  @Autowired private TestDataFactory _dataFactory;
  @MockitoBean private CurrentPatientContextHolder _contextHolder;

  private Person _person;
  private TestOrder _testOrder;
  private TestEvent _testEvent;
  private PatientLink _patientLink;

  @BeforeEach
  void setupData() {
    initSampleData();
    Organization _organization = _organizationService.getCurrentOrganization();
    Facility _facility = _dataFactory.createValidFacility(_organization);
    _person = _dataFactory.createFullPerson(_organization);
    _testEvent = _dataFactory.createTestEvent(_person, _facility);
    _testOrder = _testEvent.getTestOrder();
    _patientLink = _dataFactory.createPatientLink(_testOrder);
  }

  @Test
  void getPatientLink() {
    PatientLink result = _service.getPatientLink(_patientLink.getInternalId());
    assertEquals(result.getInternalId(), _patientLink.getInternalId());
    UUID internalId = UUID.randomUUID();
    assertThrows(InvalidPatientLinkException.class, () -> _service.getPatientLink(internalId));
  }

  @Test
  void getPatientLinkSelfLife() {
    assertEquals(10, _patientLink.getShelfLife());
  }

  @Test
  void getRefreshedPatientLink() {
    Date previousExpiry = _patientLink.getExpiresAt();
    PatientLink result = _service.getRefreshedPatientLink(_patientLink.getInternalId());
    assertTrue(result.getExpiresAt().after(previousExpiry));
  }

  @Test
  void getPatientLinkForTestEvent_patientLinkIsCreated() {
    // GIVEN
    patientLinkRepository.deleteAll();
    PatientLink expectedPatientLink = _dataFactory.createPatientLink(_testEvent.getTestOrder());
    patientLinkRepository.save(expectedPatientLink);

    // WHEN
    PatientLink patientLink = _service.getPatientLinkForTestEvent(_testEvent.getInternalId());

    // THEN
    assertThat(patientLink).isNotNull();
    assertThat(patientLink.getInternalId()).isEqualTo(expectedPatientLink.getInternalId());
  }

  @Test
  void getPatientLinkForTestEvent_createsPatientLinkWhenMissing() {
    // GIVEN
    patientLinkRepository.deleteAll();
    assertThat(patientLinkRepository.findFirstByTestOrder(_testEvent.getTestOrder())).isEmpty();

    // WHEN
    PatientLink patientLink = _service.getPatientLinkForTestEvent(_testEvent.getInternalId());

    // THEN
    assertThat(patientLink).isNotNull();
    assertThat(patientLinkRepository.findFirstByTestOrder(_testEvent.getTestOrder())).isPresent();
  }

  @Test
  void getPatientLinkForTestEvent_null() {
    // WHEN
    PatientLink patientLink = _service.getPatientLinkForTestEvent(mock(UUID.class));

    // THEN
    assertThat(patientLink).isNull();
  }

  @Test
  void verifyPatientLink() {
    assertTrue(_service.verifyPatientLink(_patientLink.getInternalId(), _person.getBirthDate()));
    assertFalse(
        _service.verifyPatientLink(
            _patientLink.getInternalId(), _person.getBirthDate().plusDays(1)));
  }

  @Test
  void patientLinkLockout() {
    UUID patientId = _patientLink.getInternalId();
    LocalDate patientBirthDate = _person.getBirthDate();
    BooleanSupplier failToVerify =
        () -> _service.verifyPatientLink(patientId, patientBirthDate.plusDays(1));

    assertFalse(failToVerify.getAsBoolean());
    assertFalse(failToVerify.getAsBoolean());
    assertFalse(failToVerify.getAsBoolean());
    assertFalse(failToVerify.getAsBoolean());
    assertFalse(failToVerify.getAsBoolean());

    assertFalse(failToVerify.getAsBoolean());
    assertFalse(failToVerify.getAsBoolean());
    assertFalse(failToVerify.getAsBoolean());
    assertFalse(failToVerify.getAsBoolean());
    assertFalse(failToVerify.getAsBoolean());

    assertThrows(
        ExpiredPatientLinkException.class,
        () -> _service.verifyPatientLink(patientId, patientBirthDate));
  }
}
