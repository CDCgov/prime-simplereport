package gov.cdc.usds.simplereport.api.patientLink;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.service.PatientLinkService;
import graphql.kickstart.tools.GraphQLQueryResolver;

@Component
public class PatientLinkResolver implements GraphQLQueryResolver {

    @Autowired
    private PatientLinkService pls;

    @Value("${feature-flags.patient-links:false}")
    private boolean patientLinksEnabled;

    public Organization getPatientLinkCurrent(String internalId) throws Exception {
        if (!patientLinksEnabled) {
            throw new Exception("Patient links not enabled");
        }
        return pls.getPatientLinkCurrent(internalId);
    }

    public Person getPatientLinkVerify(String internalId, String birthDate) throws Exception {
        if (!patientLinksEnabled) {
            throw new Exception("Patient links not enabled");
        }
        return pls.getPatientLinkVerify(internalId, birthDate);
    }

}
