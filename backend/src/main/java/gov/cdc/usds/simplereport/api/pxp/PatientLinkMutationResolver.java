package gov.cdc.usds.simplereport.api.pxp;

import gov.cdc.usds.simplereport.service.TestResultsDeliveryService;
import gov.cdc.usds.simplereport.service.model.SmsAPICallResult;
import gov.cdc.usds.simplereport.service.sms.SmsService;
import graphql.kickstart.tools.GraphQLMutationResolver;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
public class PatientLinkMutationResolver implements GraphQLMutationResolver {

  private final SmsService smsService;
  private final TestResultsDeliveryService testResultsDeliveryService;

  @Value("${simple-report.patient-link-url:https://simplereport.gov/pxp?plid=}")
  private String patientLinkUrl;

  public List<SmsAPICallResult> sendPatientLinkSms(UUID internalId) {
    return smsService.sendToPatientLink(
        internalId,
        "Please fill out your Covid-19 pre-test questionnaire: " + patientLinkUrl + internalId);
  }

  public boolean sendPatientLinkEmail(UUID internalId) {
    return testResultsDeliveryService.emailTestResults(internalId);
  }
}
