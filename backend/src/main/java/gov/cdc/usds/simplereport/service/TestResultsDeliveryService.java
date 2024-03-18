package gov.cdc.usds.simplereport.service;

import static java.text.MessageFormat.format;

import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.service.email.EmailProviderTemplate;
import gov.cdc.usds.simplereport.service.email.EmailService;
import gov.cdc.usds.simplereport.service.model.SmsAPICallResult;
import gov.cdc.usds.simplereport.service.sms.SmsService;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class TestResultsDeliveryService {

  @Value("${simple-report.patient-link-url:https://simplereport.gov/pxp?plid=}")
  private String patientLinkUrl;

  private final PatientLinkService patientLinkService;
  private final EmailService emailService;
  private final SmsService smsService;

  public boolean emailTestResults(UUID patientLinkId) {
    PatientLink patientLink = patientLinkService.getRefreshedPatientLink(patientLinkId);
    return emailTestResults(patientLink);
  }

  public boolean emailTestResults(PatientLink patientLink) {
    List<String> recipientEmailAddresses = patientLink.getTestOrder().getPatient().getEmails();

    if (recipientEmailAddresses.isEmpty()) {
      log.error("Patient missing email address");
      return false;
    }

    Map<String, Object> templateVariables =
        Map.of(
            "facility_name", patientLink.getTestOrder().getFacility().getFacilityName(),
            "organization_name", patientLink.getTestOrder().getOrganization().getOrganizationName(),
            "expiration_duration", getExpirationDuration(patientLink),
            "test_result_url", patientLinkUrl + patientLink.getInternalId());

    try {
      emailService.sendWithDynamicTemplate(
          recipientEmailAddresses,
          EmailProviderTemplate.SIMPLE_REPORT_TEST_RESULT,
          templateVariables);
    } catch (IOException e) {
      log.error(
          "failed to send email for patient link {}, exception: {}",
          patientLink.getInternalId(),
          e.getMessage());
      return false;
    }

    return true;
  }

  private String getExpirationDuration(PatientLink patientLink) {
    return format(
        "{0} day{1}", patientLink.getShelfLife(), patientLink.getShelfLife() > 1 ? "s" : "");
  }

  public boolean smsTestResults(UUID patientLinkId) {
    PatientLink patientLink = patientLinkService.getRefreshedPatientLink(patientLinkId);
    return smsTestResults(patientLink);
  }

  public boolean smsTestResults(PatientLink patientLink) {
    String message =
        format(
            "Your test result is ready to view. This link will expire after {0}: {1}",
            getExpirationDuration(patientLink), patientLinkUrl + patientLink.getInternalId());
    List<SmsAPICallResult> smsSendResults = smsService.sendToPatientLink(patientLink, message);
    return smsSendResults.stream().allMatch(SmsAPICallResult::isSuccessful);
  }

  public boolean smsTestResultsForTestEvent(UUID testEventId) {
    PatientLink patientLink = patientLinkService.getPatientLinkForTestEvent(testEventId);
    return this.smsTestResults(patientLink.getInternalId());
  }

  public boolean emailTestResultsForTestEvent(UUID testEventId) {
    PatientLink patientLink = patientLinkService.getPatientLinkForTestEvent(testEventId);
    return this.emailTestResults(patientLink.getInternalId());
  }
}
