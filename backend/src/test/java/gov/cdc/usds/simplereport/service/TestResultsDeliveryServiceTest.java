package gov.cdc.usds.simplereport.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.anyString;
import static org.mockito.Mockito.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.service.email.EmailService;
import gov.cdc.usds.simplereport.service.model.TestResultEmailTemplate;
import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(SpringExtension.class)
class TestResultsDeliveryServiceTest {

  @Mock private EmailService emailService;

  @Mock private PatientLinkService patientLinkService;

  @InjectMocks private TestResultsDeliveryService testResultsDeliveryService;

  @Captor ArgumentCaptor<TestResultEmailTemplate> emailTemplateCaptor;

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
    testResultsDeliveryService.emailTestResults(patientLink.getInternalId());

    // THEN
    verify(emailService)
        .send(eq("harry@hogwarts.edu"), eq("COVID-19 test results"), emailTemplateCaptor.capture());

    TestResultEmailTemplate emailTemplate = emailTemplateCaptor.getValue();

    Map<String, Object> templateVariables = emailTemplate.toTemplateVariables();

    assertThat(templateVariables)
        .containsEntry("facility_name", "House of Gryffindor")
        .containsEntry("expiration_duration", "2 days")
        .containsEntry("test_result_url", "https://simplereport.gov/pxp?plid=" + uuid);

    assertThat(emailTemplate.getTemplateName()).isEqualTo("test-results");
    assertThat(emailTemplate.getFacilityName()).isEqualTo("House of Gryffindor");
    assertThat(emailTemplate.getTestResultUrl())
        .isEqualTo("https://simplereport.gov/pxp?plid=" + uuid);
    assertThat(emailTemplate.getExpirationDuration()).isEqualTo("2 days");
  }

  @Test
  void emailTestResultTests_singleDayDuration() throws IOException {

    // GIVEN
    UUID uuid = UUID.randomUUID();
    PatientLink patientLink = getMockedPatientLink(uuid);
    when(patientLink.getShelfLife()).thenReturn(1);
    when(patientLinkService.getRefreshedPatientLink(uuid)).thenReturn(patientLink);

    // WHEN
    testResultsDeliveryService.emailTestResults(patientLink.getInternalId());

    // THEN
    verify(emailService).send(anyString(), anyString(), emailTemplateCaptor.capture());
    assertThat(emailTemplateCaptor.getValue().getExpirationDuration()).isEqualTo("1 day");
  }

  @Test
  void emailTestResultTests_noUserEmails() throws IOException {

    // GIVEN
    UUID uuid = UUID.randomUUID();
    PatientLink patientLink = getMockedPatientLink(uuid);
    when(patientLink.getTestOrder().getPatient().getEmail()).thenReturn(null);
    when(patientLinkService.getRefreshedPatientLink(uuid)).thenReturn(patientLink);

    // WHEN
    testResultsDeliveryService.emailTestResults(patientLink.getInternalId());

    // THEN
    verifyNoInteractions(emailService);
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
