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

/** Resolver for {@link Organization} related queries */
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

  /**
   * Retrieves a list of all organizations, optionally filtered by identity verification status
   *
   * @param identityVerified the status of identity verification by which to filter orgs; if null,
   *     no filter is applied and all organizations are returned
   * @return a list of organizations
   */
  public List<ApiOrganization> getOrganizations(Boolean identityVerified) {
    // this is N+1-ey right now, but it's no better than it was before through
    // OrganizationDataResolver and this gets called _extremely_ rarely.
    // Something to clean up in a future PR.
    // Suggested implementation: get all (non-deleted) facilities (from non-deleted organizations),
    // and group them by their Organization attribute.
    return _organizationService.getOrganizations(identityVerified).stream()
        .map(o -> new ApiOrganization(o, List.of()))
        .collect(Collectors.toList());
  }
}
