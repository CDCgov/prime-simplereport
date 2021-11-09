package gov.cdc.usds.simplereport.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.service.email.EmailProviderTemplate;
import gov.cdc.usds.simplereport.service.email.EmailService;
import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(SpringExtension.class)
class TestResultsDeliveryServiceTest {

  @Mock private EmailService emailService;

  @Mock private PatientLinkService patientLinkService;

  @InjectMocks private TestResultsDeliveryService testResultsDeliveryService;

  @BeforeEach
  void setup() {
    ReflectionTestUtils.setField(
        testResultsDeliveryService, "patientLinkUrl", "https://simplereport.gov/pxp?plid=");
  }

  @Test
  void emailTestResultTests() throws IOException {

    // GIVEN
    UUID uuid = UUID.randomUUID();
    PatientLink patientLink = getMockedPatientLink(uuid);
    when(patientLinkService.getRefreshedPatientLink(uuid)).thenReturn(patientLink);

    // WHEN
    boolean success = testResultsDeliveryService.emailTestResults(patientLink.getInternalId());

    // THEN
    assertThat(success).isTrue();
    verify(emailService)
        .sendWithDynamicTemplate(
            "harry@hogwarts.edu",
            EmailProviderTemplate.SIMPLE_REPORT_TEST_RESULT,
            Map.of(
                "facility_name", "House of Gryffindor",
                "expiration_duration", "2 days",
                "test_result_url", "https://simplereport.gov/pxp?plid=" + uuid));
  }

  @Test
  void emailTestResultTests_singleDayDuration() throws IOException {

    // GIVEN
    UUID uuid = UUID.randomUUID();
    PatientLink patientLink = getMockedPatientLink(uuid);
    when(patientLink.getShelfLife()).thenReturn(1);
    when(patientLinkService.getRefreshedPatientLink(uuid)).thenReturn(patientLink);

    // WHEN
    boolean success = testResultsDeliveryService.emailTestResults(patientLink.getInternalId());

    // THEN
    assertThat(success).isTrue();
    verify(emailService)
        .sendWithDynamicTemplate(
            "harry@hogwarts.edu",
            EmailProviderTemplate.SIMPLE_REPORT_TEST_RESULT,
            Map.of(
                "facility_name", "House of Gryffindor",
                "expiration_duration", "1 day",
                "test_result_url", "https://simplereport.gov/pxp?plid=" + uuid));
  }

  @Test
  void emailTestResultTests_noUserEmails() {

    // GIVEN
    UUID uuid = UUID.randomUUID();
    PatientLink patientLink = getMockedPatientLink(uuid);
    when(patientLink.getTestOrder().getPatient().getEmail()).thenReturn(null);
    when(patientLinkService.getRefreshedPatientLink(uuid)).thenReturn(patientLink);

    // WHEN
    boolean success = testResultsDeliveryService.emailTestResults(patientLink.getInternalId());

    // THEN
    assertThat(success).isFalse();
    verifyNoInteractions(emailService);
  }

  @Test
  void emailTestResultTests_exceptionFailure() throws IOException {

    // GIVEN
    UUID uuid = UUID.randomUUID();
    PatientLink patientLink = getMockedPatientLink(uuid);
    when(patientLinkService.getRefreshedPatientLink(uuid)).thenReturn(patientLink);
    when(emailService.sendWithDynamicTemplate(any(), any(), any())).thenThrow(IOException.class);

    // WHEN
    boolean success = testResultsDeliveryService.emailTestResults(patientLink.getInternalId());

    // THEN
    assertThat(success).isFalse();
  }

  private PatientLink getMockedPatientLink(UUID internalId) {
    Facility facility = mock(Facility.class);
    when(facility.getFacilityName()).thenReturn("House of Gryffindor");

    Person person = mock(Person.class);
    when(person.getEmail()).thenReturn("harry@hogwarts.edu");

    TestOrder testOrder = mock(TestOrder.class);
    when(testOrder.getPatient()).thenReturn(person);
    when(testOrder.getFacility()).thenReturn(facility);

    PatientLink patientLink = mock(PatientLink.class);
    when(patientLink.getInternalId()).thenReturn(internalId);
    when(patientLink.getTestOrder()).thenReturn(testOrder);
    when(patientLink.getShelfLife()).thenReturn(2);

    return patientLink;
  }
}
