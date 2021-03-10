package gov.cdc.usds.simplereport.api.model;

import gov.cdc.usds.simplereport.config.authorization.UserPermission;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.service.model.UserInfo;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

public class User {

  private UserInfo wrapped;

  public User(UserInfo user) {
    this.wrapped = user;
  }

  public UUID getId() {
    return wrapped.getId();
  }

  public Optional<Organization> getOrganization() {
    return wrapped.getOrganization();
  }

  public String getFirstName() {
    return wrapped.getFirstName();
  }

  public String getMiddleName() {
    return wrapped.getMiddleName();
  }

  public String getLastName() {
    return wrapped.getLastName();
  }

  public String getSuffix() {
    return wrapped.getSuffix();
  }

  // Note: we assume a user's email and login username are the same thing.
  public String getEmail() {
    return wrapped.getEmail();
  }

  public boolean getIsAdmin() {
    return wrapped.getIsAdmin();
  }

  public List<UserPermission> getPermissions() {
    return wrapped.getPermissions();
  }

  public String getRoleDescription() {
    return buildRoleDescription(getRole(), getIsAdmin());
  }

  private String buildRoleDescription(Optional<ApiOrganizationRole> role, boolean isAdmin) {
    if (role.isPresent()) {
      String desc = role.get().getDescription();
      return isAdmin ? desc + " (SU)" : desc;
    } else {
      return isAdmin ? "Super Admin" : "Misconfigured user";
    }
  }

  // there's no good reason that this variable is a list at this point, but changing
  // it to a plain variable is too much change for the time being.
  public List<ApiOrganizationRole> getRoles() {
    Optional<ApiOrganizationRole> result = getRole();
    return result.isEmpty() ? List.of() : List.of(result.get());
  }

  private Optional<ApiOrganizationRole> getRole() {
    return ApiOrganizationRole.fromOrganizationRoles(wrapped.getRoles());
  }

  public List<ApiFacility> getFacilities() {
    return wrapped.getFacilities().stream()
        .map(f -> new ApiFacility(f))
        .collect(Collectors.toList());
  }
}
