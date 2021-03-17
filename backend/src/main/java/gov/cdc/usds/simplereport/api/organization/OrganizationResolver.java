package gov.cdc.usds.simplereport.api.organization;

import gov.cdc.usds.simplereport.api.model.ApiOrganization;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.model.OrganizationRoles;
import graphql.kickstart.tools.GraphQLQueryResolver;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/** Created by nickrobison on 11/17/20 */
@Component
public class OrganizationResolver implements GraphQLQueryResolver {

  private OrganizationService _organizationService;

  public OrganizationResolver(OrganizationService os) {
    _organizationService = os;
  }

  public Optional<ApiOrganization> getOrganization() {
    Optional<OrganizationRoles> roles = _organizationService.getCurrentOrganizationRoles();
    return roles.map(
        r -> {
          Organization o = r.getOrganization();
          Set<Facility> fs = r.getFacilities();
          return new ApiOrganization(o, fs);
        });
  }

  public List<ApiOrganization> getOrganizations() {
    // this is N+1-ey right now, but it's no better than it was before through
    // OrganizationDataResolver and this gets called _extremely_ rarely.
    // Something to clean up in a future PR.
    return _organizationService.getOrganizations().stream()
        .map(o -> new ApiOrganization(o, _organizationService.getFacilities(o)))
        .collect(Collectors.toList());
  }
}
