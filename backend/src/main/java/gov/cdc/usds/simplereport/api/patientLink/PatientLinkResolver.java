package gov.cdc.usds.simplereport.api.patientLink;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.service.PatientLinkService;
import graphql.kickstart.tools.GraphQLQueryResolver;

@Component
public class PatientLinkResolver implements GraphQLQueryResolver {

    @Autowired
    private PatientLinkService pls;

    public PatientLink getPatientLinkById(String internalId) {
        return pls.getPatientLinkById(internalId);
    }

    public List<PatientLink> getPatientLink() {
        return pls.fetchPatientLinks();
    }

}
