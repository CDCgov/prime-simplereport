package gov.cdc.usds.simplereport.service;

import static java.text.MessageFormat.format;

import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.service.email.EmailProviderTemplate;
import gov.cdc.usds.simplereport.service.email.EmailService;
import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.NotNull;
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

  public boolean emailTestResults(UUID patientLinkId) {
    PatientLink patientLink = patientLinkService.getRefreshedPatientLink(patientLinkId);
    return emailTestResults(patientLink);
  }

  public boolean emailTestResults(PatientLink patientLink) {
    String recipientEmailAddresses = patientLink.getTestOrder().getPatient().getEmail();

    if (recipientEmailAddresses == null) {
      log.error("Patient missing email address");
      return false;
    }

    Map<String, Object> templateVariables =
        Map.of(
            "facility_name", patientLink.getTestOrder().getFacility().getFacilityName(),
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

  @NotNull
  private String getExpirationDuration(PatientLink patientLink) {
    return format(
        "{0} day{1}", patientLink.getShelfLife(), patientLink.getShelfLife() > 1 ? "s" : "");
  }
}
