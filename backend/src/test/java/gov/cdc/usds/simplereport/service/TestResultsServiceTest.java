package gov.cdc.usds.simplereport.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.service.email.EmailService;
import gov.cdc.usds.simplereport.service.model.TestResultEmailTemplate;
import java.io.IOException;
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
class TestResultsServiceTest {

  @Mock private EmailService emailService;

  @Mock private PatientLinkService patientLinkService;

  @InjectMocks private TestResultsService testResultsService;

  @Captor ArgumentCaptor<TestResultEmailTemplate> emailTemplateCaptor;

  @BeforeEach
  void setup() {
    ReflectionTestUtils.setField(
        testResultsService, "patientLinkUrl", "https://simplereport.gov/pxp?plid=");
  }

  @Test
  void emailTestResultTests() throws IOException {

    // GIVEN
    UUID uuid = UUID.randomUUID();
    PatientLink patientLink = getMockedPatientLink(uuid);
    when(patientLinkService.getRefreshedPatientLink(uuid)).thenReturn(patientLink);

    // WHEN
    testResultsService.emailTestResults(patientLink.getInternalId());

    // THEN
    verify(emailService)
        .send(eq("harry@hogwarts.edu"), eq("COVID-19 test results"), emailTemplateCaptor.capture());

    TestResultEmailTemplate emailTemplate = emailTemplateCaptor.getValue();
    assertThat(emailTemplate.getTemplateName()).isEqualTo("SIMPLE_REPORT_TEST_RESULT");
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
    testResultsService.emailTestResults(patientLink.getInternalId());

    // THEN
    verify(emailService).send(anyString(), anyString(), emailTemplateCaptor.capture());
    assertThat(emailTemplateCaptor.getValue().getExpirationDuration()).isEqualTo("1 day");
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
