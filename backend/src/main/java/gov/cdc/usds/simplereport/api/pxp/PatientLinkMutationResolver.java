package gov.cdc.usds.simplereport.api.pxp;

import gov.cdc.usds.simplereport.service.TestResultsDeliveryService;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

@RequiredArgsConstructor
@Controller
public class PatientLinkMutationResolver {
  private final TestResultsDeliveryService testResultsDeliveryService;

  @Value("${simple-report.patient-link-url:https://simplereport.gov/pxp?plid=}")
  private String patientLinkUrl;

  @MutationMapping
  public boolean sendPatientLinkSms(@Argument UUID internalId) {
    return testResultsDeliveryService.smsTestResults(internalId);
  }

  @MutationMapping
  public boolean sendPatientLinkEmail(@Argument UUID internalId) {
    return testResultsDeliveryService.emailTestResults(internalId);
  }

  @MutationMapping
  public boolean sendPatientLinkSmsByTestEventId(@Argument UUID testEventId) {
    return testResultsDeliveryService.smsTestResultsForTestEvent(testEventId);
  }

  @MutationMapping
  public boolean sendPatientLinkEmailByTestEventId(@Argument UUID testEventId) {
    return testResultsDeliveryService.emailTestResultsForTestEvent(testEventId);
  }
}
