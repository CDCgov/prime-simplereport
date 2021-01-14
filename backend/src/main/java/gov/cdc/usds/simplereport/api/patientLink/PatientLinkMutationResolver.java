package gov.cdc.usds.simplereport.api.patientLink;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.service.PatientLinkService;
import graphql.kickstart.tools.GraphQLMutationResolver;

@Component
public class PatientLinkMutationResolver implements GraphQLMutationResolver {

    @Autowired
    private PatientLinkService pls;

    public PatientLink createPatientLink(UUID testOrderUuid) {
        return pls.createPatientLink(testOrderUuid);
    }

}
