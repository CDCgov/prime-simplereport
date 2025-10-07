package gov.cdc.usds.simplereport.db.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.data.auditing.AuditingHandler;
import org.springframework.data.auditing.DateTimeProvider;

class PatientLinkRepositoryTest extends BaseRepositoryTest {
  @MockBean DateTimeProvider dateTimeProvider;

  @SpyBean private AuditingHandler handler;

  @Autowired private TestDataFactory testDataFactory;

  @Autowired private PatientLinkRepository patientLinkRepository;

  @Test
  void findMostRecentByTestOrderIdInTest() {
    // GIVEN
    mockCreationTime("2020-01-01 00:00");
    Organization org = testDataFactory.saveValidOrganization();
    Facility facility = testDataFactory.createValidFacility(org, "PatientLinkTest Facility");
    Person patient = testDataFactory.createFullPerson(org);
    Person patient2 = testDataFactory.createFullPerson(org);
    Person patient3 = testDataFactory.createFullPerson(org);
    TestOrder testOrder1 = testDataFactory.createTestOrder(patient, facility);
    TestOrder testOrder2 = testDataFactory.createTestOrder(patient2, facility);
    TestOrder testOrderNoPatientLink =
        testDataFactory.createTestOrderNoPatientLink(patient3, facility);

    mockCreationTime("2020-02-17 00:00");
    PatientLink testOrder1OlderPatientLink = testDataFactory.createPatientLink(testOrder1);
    mockCreationTime("2020-05-17 00:00");
    PatientLink testOrder1MostRecentPatientLink = testDataFactory.createPatientLink(testOrder1);

    mockCreationTime("2022-05-20 00:00");
    PatientLink testOrder2OlderPatientLink = testDataFactory.createPatientLink(testOrder2);
    mockCreationTime("2022-06-23 00:00");
    PatientLink testOrder2MostRecentPatientLink = testDataFactory.createPatientLink(testOrder2);

    // WHEN
    List<PatientLink> found =
        patientLinkRepository.findMostRecentByTestOrderIdIn(
            List.of(
                testOrder1.getInternalId(),
                testOrder2.getInternalId(),
                testOrderNoPatientLink.getInternalId()));

    // THEN
    assertThat(found).hasSize(2);
    assertThat(found).contains(testOrder1MostRecentPatientLink, testOrder2MostRecentPatientLink);
    assertThat(found).doesNotContain(testOrder1OlderPatientLink, testOrder2OlderPatientLink);
  }

  private void mockCreationTime(String date) {
    LocalDateTime localDateTime = getLocalDateTime(date);
    when(dateTimeProvider.getNow()).thenReturn(Optional.of(localDateTime));
    handler.setDateTimeProvider(dateTimeProvider);
  }

  private LocalDateTime getLocalDateTime(String date) {
    return LocalDateTime.parse(date, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
  }
}
