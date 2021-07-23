package gov.cdc.usds.simplereport.api.pxp;

import gov.cdc.usds.simplereport.service.PatientLinkService;
import gov.cdc.usds.simplereport.service.model.SmsDeliveryResult;
import gov.cdc.usds.simplereport.service.sms.SmsService;
import graphql.kickstart.tools.GraphQLMutationResolver;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class PatientLinkMutationResolver implements GraphQLMutationResolver {

  @Autowired private PatientLinkService pls;

  @Autowired private SmsService smsService;

  @Value("${simple-report.patient-link-url:https://simplereport.gov/pxp?plid=}")
  private String patientLinkUrl;

  public List<SmsDeliveryResult> sendPatientLinkSms(UUID internalId) {
    return smsService.sendToPatientLink(
        internalId,
        "Please fill out your Covid-19 pre-test questionnaire: " + patientLinkUrl + internalId);
  }
}
