package gov.cdc.usds.simplereport.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.service.email.EmailProviderTemplate;
import gov.cdc.usds.simplereport.service.email.EmailService;
import gov.cdc.usds.simplereport.service.model.SmsAPICallResult;
import gov.cdc.usds.simplereport.service.sms.SmsService;
import java.io.IOException;
import java.util.Collections;
import java.util.List;
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
  @Mock private SmsService smsService;

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
            List.of("harry@hogwarts.edu"),
            EmailProviderTemplate.SIMPLE_REPORT_TEST_RESULT,
            Map.of(
                "facility_name", "House of Gryffindor",
                "organization_name", "Hogwarts",
                "expiration_duration", "2 days",
                "test_result_url", "https://simplereport.gov/pxp?plid=" + uuid));
  }

  @Test
  void emailTestResultTests_forTestEventId() throws IOException {

    // GIVEN
    UUID patientLinkId = UUID.randomUUID();
    UUID testEventId = UUID.randomUUID();
    PatientLink patientLink = getMockedPatientLink(patientLinkId);

    when(patientLinkService.getPatientLinkForTestEvent(testEventId)).thenReturn(patientLink);
    when(patientLinkService.getRefreshedPatientLink(patientLinkId)).thenReturn(patientLink);

    // WHEN
    boolean success = testResultsDeliveryService.emailTestResultsForTestEvent(testEventId);

    // THEN
    assertThat(success).isTrue();
    verify(emailService)
        .sendWithDynamicTemplate(
            List.of("harry@hogwarts.edu"),
            EmailProviderTemplate.SIMPLE_REPORT_TEST_RESULT,
            Map.of(
                "facility_name", "House of Gryffindor",
                "organization_name", "Hogwarts",
                "expiration_duration", "2 days",
                "test_result_url", "https://simplereport.gov/pxp?plid=" + patientLinkId));
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
            List.of("harry@hogwarts.edu"),
            EmailProviderTemplate.SIMPLE_REPORT_TEST_RESULT,
            Map.of(
                "facility_name", "House of Gryffindor",
                "organization_name", "Hogwarts",
                "expiration_duration", "1 day",
                "test_result_url", "https://simplereport.gov/pxp?plid=" + uuid));
  }

  @Test
  void emailTestResultTests_noUserEmails() {

    // GIVEN
    UUID uuid = UUID.randomUUID();
    PatientLink patientLink = getMockedPatientLink(uuid);
    when(patientLink.getTestOrder().getPatient().getEmails()).thenReturn(Collections.emptyList());
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

  @Test
  void smsTextTestResultTest_forTestEventId() {
    // GIVEN
    UUID patientLinkId = UUID.randomUUID();
    UUID testEventId = UUID.randomUUID();
    PatientLink patientLink = getMockedPatientLink(patientLinkId);

    when(patientLinkService.getPatientLinkForTestEvent(testEventId)).thenReturn(patientLink);
    when(patientLinkService.getRefreshedPatientLink(patientLinkId)).thenReturn(patientLink);
    when(smsService.sendToPatientLink(any(PatientLink.class), anyString()))
        .thenReturn(List.of(SmsAPICallResult.builder().successful(true).build()));

    // WHEN
    boolean success = testResultsDeliveryService.smsTestResultsForTestEvent(testEventId);

    // THEN
    assertThat(success).isTrue();
    String message =
        "Your COVID-19 test result is ready to view. This link will expire after 2 days: https://simplereport.gov/pxp?plid="
            + patientLinkId;
    verify(smsService).sendToPatientLink(patientLink, message);
  }

  @Test
  void smsTextTestResultTest() {
    // GIVEN
    UUID uuid = UUID.randomUUID();
    PatientLink patientLink = getMockedPatientLink(uuid);
    when(patientLinkService.getRefreshedPatientLink(uuid)).thenReturn(patientLink);
    when(smsService.sendToPatientLink(any(PatientLink.class), anyString()))
        .thenReturn(List.of(SmsAPICallResult.builder().successful(true).build()));

    // WHEN
    boolean success = testResultsDeliveryService.smsTestResults(patientLink.getInternalId());

    // THEN
    assertThat(success).isTrue();
    String message =
        "Your COVID-19 test result is ready to view. This link will expire after 2 days: https://simplereport.gov/pxp?plid="
            + uuid;
    verify(smsService).sendToPatientLink(patientLink, message);
  }

  @Test
  void smsTextTestResultTest_failure() {
    // GIVEN
    UUID uuid = UUID.randomUUID();
    PatientLink patientLink = getMockedPatientLink(uuid);
    when(patientLinkService.getRefreshedPatientLink(uuid)).thenReturn(patientLink);
    when(smsService.sendToPatientLink(any(PatientLink.class), anyString()))
        .thenReturn(
            List.of(
                SmsAPICallResult.builder().successful(true).build(),
                SmsAPICallResult.builder().successful(false).build()));

    // WHEN
    boolean success = testResultsDeliveryService.smsTestResults(patientLink.getInternalId());

    // THEN
    assertThat(success).isFalse();
    String message =
        "Your COVID-19 test result is ready to view. This link will expire after 2 days: https://simplereport.gov/pxp?plid="
            + uuid;
    verify(smsService).sendToPatientLink(patientLink, message);
  }

  private PatientLink getMockedPatientLink(UUID internalId) {
    Facility facility = mock(Facility.class);
    when(facility.getFacilityName()).thenReturn("House of Gryffindor");

    Organization org = mock(Organization.class);
    when(org.getOrganizationName()).thenReturn("Hogwarts");

    Person person = mock(Person.class);
    when(person.getEmail()).thenReturn("harry@hogwarts.edu");
    when(person.getEmails()).thenReturn(List.of("harry@hogwarts.edu"));

    TestOrder testOrder = mock(TestOrder.class);
    when(testOrder.getPatient()).thenReturn(person);
    when(testOrder.getFacility()).thenReturn(facility);
    when(testOrder.getOrganization()).thenReturn(org);

    PatientLink patientLink = mock(PatientLink.class);
    when(patientLink.getInternalId()).thenReturn(internalId);
    when(patientLink.getTestOrder()).thenReturn(testOrder);
    when(patientLink.getShelfLife()).thenReturn(2);

    return patientLink;
  }
}
