package gov.cdc.usds.simplereport.api.pxp;

import org.springframework.stereotype.Component;

import gov.cdc.usds.simplereport.api.model.ApiTestOrder;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import graphql.kickstart.tools.GraphQLResolver;

@Component
public class PatientLinkDataResolver implements GraphQLResolver<PatientLink> {

    public ApiTestOrder getTestOrder(PatientLink pl) {
        return new ApiTestOrder(pl.getTestOrder());
    }

}
