package gov.cdc.usds.simplereport.api.pxp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.service.PatientLinkService;
import gov.cdc.usds.simplereport.service.sms.SmsService;
import graphql.kickstart.tools.GraphQLMutationResolver;

@Component
public class PatientLinkMutationResolver implements GraphQLMutationResolver {

    @Autowired
    private PatientLinkService pls;

    @Autowired
    private SmsService svc;
  
    @Value("${simple-report.patient-link-url}")
    private String patientLinkUrl;
  
    public String sendPatientLinkSms(String internalId) {
      return svc.sendToPatientLink(internalId,
          "Please fill out your Covid-19 pre-test questionnaire: " + patientLinkUrl + internalId);
    }

    public PatientLink refreshPatientLink(String internalId) {
        return pls.refreshPatientLink(internalId);
    }
}
