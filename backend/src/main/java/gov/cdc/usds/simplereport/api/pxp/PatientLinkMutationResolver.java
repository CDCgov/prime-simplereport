package gov.cdc.usds.simplereport.api.pxp;

import com.google.i18n.phonenumbers.NumberParseException;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.service.PatientLinkService;
import gov.cdc.usds.simplereport.service.sms.SmsService;
import graphql.kickstart.tools.GraphQLMutationResolver;
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

  public String sendPatientLinkSms(UUID internalId) throws NumberParseException {
    return smsService.sendToPatientLink(
        internalId,
        "Please fill out your Covid-19 pre-test questionnaire: " + patientLinkUrl + internalId);
  }

  public PatientLink refreshPatientLink(String internalId) {
    return pls.refreshPatientLink(UUID.fromString(internalId));
  }
}
