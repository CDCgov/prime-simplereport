package gov.cdc.usds.simplereport.api.organization;

import gov.cdc.usds.simplereport.service.OrganizationService;
import graphql.kickstart.tools.GraphQLMutationResolver;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Created by nickrobison on 11/17/20
 */
@Component
public class OrganizationMutationResolver implements GraphQLMutationResolver {

    private final OrganizationService _os;

    public OrganizationMutationResolver(OrganizationService os) {
        _os = os;
    }

    public void updateOrganization(String testingFacilityName,
                                   String cliaNumber,
                                   String orderingProviderName,
                                   String orderingProviderNPI,
                                   String orderingProviderStreet,
                                   String orderingProviderStreetTwo,
                                   String orderingProviderCity,
                                   String orderingProviderCounty,
                                   String orderingProviderState,
                                   String orderingProviderZipCode,
                                   String orderingProviderPhone,
                                   List<String> devices,
                                   String defaultDevice) {
        _os.updateOrganization(testingFacilityName, cliaNumber, orderingProviderName, orderingProviderNPI, orderingProviderStreet, orderingProviderStreetTwo
                , orderingProviderCity, orderingProviderCounty, orderingProviderState, orderingProviderZipCode, orderingProviderPhone, devices, defaultDevice);
    }



}
