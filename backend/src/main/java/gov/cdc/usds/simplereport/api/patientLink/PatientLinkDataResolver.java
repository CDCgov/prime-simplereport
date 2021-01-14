package gov.cdc.usds.simplereport.api.patientLink;

import org.springframework.stereotype.Component;

import gov.cdc.usds.simplereport.api.model.ApiTestOrder;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import graphql.kickstart.tools.GraphQLResolver;

@Component
public class PatientLinkDataResolver implements GraphQLResolver<PatientLink> {

    public ApiTestOrder getTestOrder(PatientLink pl) {
        return new ApiTestOrder(pl.getTestOrder());
    }

}
