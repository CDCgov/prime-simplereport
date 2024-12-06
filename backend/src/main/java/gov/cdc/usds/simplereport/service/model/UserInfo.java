package gov.cdc.usds.simplereport.service.model;

import static java.lang.String.CASE_INSENSITIVE_ORDER;

import com.okta.sdk.resource.model.UserStatus;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.config.authorization.UserPermission;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.DatabaseEntity;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PersonEntity;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

public class UserInfo extends WrappedEntity<ApiUser> implements DatabaseEntity, PersonEntity {

  private Optional<Organization> org;
  private boolean isAdmin;
  private List<UserPermission> permissions;
  private List<OrganizationRole> roles;
  private List<Facility> facilities;
  private UserStatus status;

  public UserInfo(ApiUser user, Optional<OrganizationRoles> orgwrapper, boolean isAdmin) {
    super(user);
    this.org = orgwrapper.map(OrganizationRoles::getOrganization);
    this.permissions = new ArrayList<>();
    this.roles =
        orgwrapper.map(OrganizationRoles::getGrantedRoles).orElse(Set.of()).stream()
            .collect(Collectors.toList());
    orgwrapper.map(OrganizationRoles::getGrantedPermissions).ifPresent(permissions::addAll);
    List<Facility> facilityList =
        orgwrapper.map(OrganizationRoles::getFacilities).orElse(Set.of()).stream()
            .collect(Collectors.toList());
    facilityList.sort(Comparator.comparing(Facility::getFacilityName, CASE_INSENSITIVE_ORDER));
    this.facilities = facilityList;
    this.isAdmin = isAdmin;
  }

  public UserInfo(
      ApiUser user, Optional<OrganizationRoles> orgwrapper, boolean isAdmin, UserStatus status) {
    super(user);
    this.org = orgwrapper.map(OrganizationRoles::getOrganization);
    this.permissions = new ArrayList<>();
    this.roles =
        orgwrapper.map(OrganizationRoles::getGrantedRoles).orElse(Set.of()).stream()
            .collect(Collectors.toList());
    orgwrapper.map(OrganizationRoles::getGrantedPermissions).ifPresent(permissions::addAll);
    this.facilities =
        orgwrapper.map(OrganizationRoles::getFacilities).orElse(Set.of()).stream()
            .collect(Collectors.toList());
    this.isAdmin = isAdmin;
    this.status = status;
  }

  @Override
  public UUID getInternalId() {
    return wrapped.getInternalId();
  }

  @Override
  public PersonName getNameInfo() {
    return getWrapped().getNameInfo();
  }

  public Optional<Organization> getOrganization() {
    return org;
  }

  // Note: we assume a user's email and login username are the same thing.
  public String getEmail() {
    return wrapped.getLoginEmail();
  }

  public boolean getIsAdmin() {
    return isAdmin;
  }

  public List<UserPermission> getPermissions() {
    return permissions;
  }

  public List<OrganizationRole> getRoles() {
    return roles;
  }

  public List<Facility> getFacilities() {
    return facilities;
  }

  public UserStatus getUserStatus() {
    return status;
  }

  public boolean getIsDeleted() {
    return wrapped.getIsDeleted();
  }
}
