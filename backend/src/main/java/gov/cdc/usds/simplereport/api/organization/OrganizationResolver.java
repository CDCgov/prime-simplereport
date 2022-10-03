package gov.cdc.usds.simplereport.api.organization;

import gov.cdc.usds.simplereport.api.model.ApiFacility;
import gov.cdc.usds.simplereport.api.model.ApiOrganization;
import gov.cdc.usds.simplereport.api.model.ApiPendingOrganization;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.service.OrganizationQueueService;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.model.OrganizationRoles;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

/** Resolver for {@link Organization} related queries */
@Controller
public class OrganizationResolver {

  private OrganizationService _organizationService;
  private OrganizationQueueService _organizationQueueService;

  public OrganizationResolver(OrganizationService os, OrganizationQueueService oqs) {
    _organizationService = os;
    _organizationQueueService = oqs;
  }

  @QueryMapping
  public Optional<ApiOrganization> organization() {
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
  @QueryMapping
  public List<ApiOrganization> organizations(@Argument Boolean identityVerified) {
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
  @QueryMapping
  public List<ApiPendingOrganization> pendingOrganizations() {
    return _organizationQueueService.getUnverifiedQueuedOrganizations().stream()
        .map(ApiPendingOrganization::new)
        .collect(Collectors.toList());
  }

  /**
   * Retrieves all facilities for the current org that are accessible to the current user
   *
   * @param showArchived whether or not to include archived facilities
   * @return set of facilities
   */
  @QueryMapping
  public Set<ApiFacility> facilities(@Argument Boolean showArchived) {
    Set<Facility> facilities = _organizationService.getAccessibleFacilities();
    if (showArchived) {
      facilities.addAll(_organizationService.getArchivedFacilities());
    }
    return facilities.stream().map(ApiFacility::new).collect(Collectors.toSet());
  }
}
