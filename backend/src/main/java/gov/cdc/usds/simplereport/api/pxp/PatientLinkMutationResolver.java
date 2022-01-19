package gov.cdc.usds.simplereport.api.pxp;

import gov.cdc.usds.simplereport.service.TestResultsDeliveryService;
import graphql.kickstart.tools.GraphQLMutationResolver;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
public class PatientLinkMutationResolver implements GraphQLMutationResolver {
  private final TestResultsDeliveryService testResultsDeliveryService;

  @Value("${simple-report.patient-link-url:https://simplereport.gov/pxp?plid=}")
  private String patientLinkUrl;

  public boolean sendPatientLinkSms(UUID patientLinkId) {
    return testResultsDeliveryService.smsTestResults(patientLinkId);
  }

  public boolean sendPatientLinkEmail(UUID patientLinkId) {
    return testResultsDeliveryService.emailTestResults(patientLinkId);
  }

  public boolean sendPatientLinkSmsByTestEventId(UUID testEventId) {
    return testResultsDeliveryService.smsTestResultsForTestEvent(testEventId);
  }

  public boolean sendPatientLinkEmailByTestEventId(UUID testEventId) {
    return testResultsDeliveryService.emailTestResultsForTestEvent(testEventId);
  }
}
