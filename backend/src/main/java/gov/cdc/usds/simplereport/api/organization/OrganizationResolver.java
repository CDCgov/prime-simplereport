package gov.cdc.usds.simplereport.api.organization;

import com.okta.sdk.resource.user.User;
import gov.cdc.usds.simplereport.api.model.ApiOrganization;
import gov.cdc.usds.simplereport.api.model.ApiPendingOrganization;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.service.OrganizationQueueService;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.model.OrganizationRoles;
import graphql.kickstart.tools.GraphQLQueryResolver;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.springframework.stereotype.Component;

/** Resolver for {@link Organization} related queries */
@Component
public class OrganizationResolver implements GraphQLQueryResolver {

  private OrganizationService _organizationService;
  private OrganizationQueueService _organizationQueueService;

  public OrganizationResolver(OrganizationService os, OrganizationQueueService oqs) {
    _organizationService = os;
    _organizationQueueService = oqs;
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
    // This is used to populate the list of organizations in a dropdown on some frontend admin
    // pages (such as tenant data access).  The only uses of it so far query for the org name and
    // external id.  To get around some n+1 problems, for now this will not return facilities even
    // if they are included in the query.
    //
    // We really need a data loader for facilities, but it is non-trivial because the list of
    // facilities is returned differently when querying permissions data vs listing facilities.
    // Both use the same underlying classes, though.  A suggested fix is to add `allFacilities`
    // for retrieving the list of facilities and continuing to use `facilities` for permissions.
    return _organizationService.getOrganizations(identityVerified).stream()
        .map(o -> new ApiOrganization(o, List.of()))
        .collect(Collectors.toList());
  }

  /**
   * Retrieves a list of all pending organizations AND organization queue items
   *
   * @return a list of pending organizations
   */
  public List<ApiPendingOrganization> getPendingOrganizations() {
    List<ApiPendingOrganization> pendingOrgsAlreadyCreated =
        _organizationService.getOrganizations(false).stream()
            .map(
                org -> {
                  User adminUser = _organizationService.getAdminUserForPendingOrganization(org);
                  return new ApiPendingOrganization(org, adminUser);
                })
            .collect(Collectors.toList());

    List<ApiPendingOrganization> pendingOrgsInQueue =
        _organizationQueueService.getUnverifiedQueuedOrganizations().stream()
            .map(org -> new ApiPendingOrganization(org))
            .collect(Collectors.toList());

    return Stream.concat(pendingOrgsAlreadyCreated.stream(), pendingOrgsInQueue.stream())
        .collect(Collectors.toList());
  }
}
