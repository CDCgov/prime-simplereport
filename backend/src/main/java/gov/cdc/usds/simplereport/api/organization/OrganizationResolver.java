package gov.cdc.usds.simplereport.api.organization;

import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.service.OrganizationService;
import graphql.kickstart.tools.GraphQLQueryResolver;
import org.springframework.stereotype.Component;

/**
 * Created by nickrobison on 11/17/20
 */
@Component
public class OrganizationResolver implements GraphQLQueryResolver  {

    private final OrganizationService _os;

    public OrganizationResolver(OrganizationService os) {
        _os = os;
    }

    public Organization getOrganization() {
        return _os.getCurrentOrganization();
    }
}