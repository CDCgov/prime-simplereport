package gov.cdc.usds.simplereport.api.organization;

import gov.cdc.usds.simplereport.api.model.ApiFacility;
import gov.cdc.usds.simplereport.api.model.ApiOrganization;
import gov.cdc.usds.simplereport.api.model.ApiPendingOrganization;
import gov.cdc.usds.simplereport.api.model.FacilityStats;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.FacilityLabTestOrder;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.service.OrganizationQueueService;
import gov.cdc.usds.simplereport.service.OrganizationService;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

/** Resolver for {@link Organization} related queries */
@Controller
public class OrganizationResolver {

  private final OrganizationService _organizationService;
  private final OrganizationQueueService _organizationQueueService;

  public OrganizationResolver(OrganizationService os, OrganizationQueueService oqs) {
    _organizationService = os;
    _organizationQueueService = oqs;
  }

  @QueryMapping
  @AuthorizationConfiguration.RequireGlobalAdminUser
  public ApiOrganization organization(@Argument UUID id) {
    Organization org;
    try {
      org = _organizationService.getOrganizationById(id);
    } catch (IllegalGraphqlArgumentException e) {
      return null;
    }
    var facilities = _organizationService.getFacilities(org);
    return new ApiOrganization(org, facilities);
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
   * Retrieves a list of all organizations, filtered by name
   *
   * @return a list of organizations
   */
  @QueryMapping
  @AuthorizationConfiguration.RequireGlobalAdminUser
  public List<ApiOrganization> organizationsByName(
      @Argument String name, @Argument Boolean isDeleted) {
    List<Organization> orgs = _organizationService.getOrganizationsByName(name, isDeleted);
    if (orgs.isEmpty()) {
      return List.of();
    } else {
      return orgs.stream()
          .map(o -> new ApiOrganization(o, _organizationService.getFacilities(o)))
          .collect(Collectors.toList());
    }
  }

  /**
   * Retrieves a list of all pending organizations AND organization queue items
   *
   * @return a list of pending organizations
   */
  @QueryMapping
  @AuthorizationConfiguration.RequireGlobalAdminUser
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

  @QueryMapping
  public Optional<ApiFacility> facility(@Argument UUID id) {
    Set<Facility> facilities = _organizationService.getAccessibleFacilities();
    Optional<Facility> facility =
        facilities.stream().filter(f -> f.getInternalId().equals(id)).findFirst();
    return facility.map(ApiFacility::new);
  }

  @QueryMapping
  public FacilityStats facilityStats(@Argument UUID facilityId) {
    return this._organizationService.getFacilityStats(facilityId);
  }

  @QueryMapping
  @AuthorizationConfiguration.RequireGlobalAdminUser
  public List<UUID> getOrgAdminUserIds(@Argument UUID orgId) {
    return _organizationService.getOrgAdminUserIds(orgId);
  }

  @QueryMapping
  @AuthorizationConfiguration.RequireGlobalAdminUser
  public List<FacilityLabTestOrder> facilityLabTestOrders(@Argument UUID facilityId) {
    return _organizationService.getFacilityLabTestOrders(facilityId);
  }
}
