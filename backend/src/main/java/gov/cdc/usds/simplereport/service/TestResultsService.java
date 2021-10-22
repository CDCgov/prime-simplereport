package gov.cdc.usds.simplereport.service;

import static java.text.MessageFormat.format;

import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.service.email.EmailService;
import gov.cdc.usds.simplereport.service.model.TestResultEmailTemplate;
import java.io.IOException;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TestResultsService {

  @Value("${simple-report.patient-link-url:https://simplereport.gov/pxp?plid=}")
  private String patientLinkUrl;

  private final PatientLinkService patientLinkService;
  private final EmailService emailService;

  public void emailTestResults(UUID patientLinkId) throws IOException {

    PatientLink patientLink = patientLinkService.getRefreshedPatientLink(patientLinkId);

    TestResultEmailTemplate template =
        TestResultEmailTemplate.builder()
            .facilityName(patientLink.getTestOrder().getFacility().getFacilityName())
            .testResultUrl(patientLinkUrl + patientLink.getInternalId())
            .expirationDuration(getExpirationDuration(patientLink))
            .build();

    emailService.send(
        patientLink.getTestOrder().getPatient().getEmail(), "COVID-19 test results", template);
  }

  @NotNull
  private String getExpirationDuration(PatientLink patientLink) {
    return format(
        "{0} day{1}", patientLink.getShelfLife(), patientLink.getShelfLife() > 1 ? "s" : "");
  }
}
