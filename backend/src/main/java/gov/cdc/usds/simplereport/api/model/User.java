package gov.cdc.usds.simplereport.api.model;

import gov.cdc.usds.simplereport.api.model.facets.PersonWrapper;
import gov.cdc.usds.simplereport.config.authorization.UserPermission;
import gov.cdc.usds.simplereport.service.model.UserInfo;
import gov.cdc.usds.simplereport.service.model.WrappedEntity;
import java.util.List;
import java.util.Optional;
import org.openapitools.client.model.UserStatus;

public class User extends WrappedEntity<UserInfo> implements PersonWrapper<UserInfo> {

  public User(UserInfo user) {
    super(user);
  }

  public Optional<ApiOrganization> getOrganization() {
    return wrapped.getOrganization().map(o -> new ApiOrganization(o, wrapped.getFacilities()));
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

  private String buildRoleDescription(Optional<Role> role, boolean isAdmin) {
    if (role.isPresent()) {
      String desc = role.get().getDescription();
      return isAdmin ? desc + " (SU)" : desc;
    } else {
      return isAdmin ? "Super Admin" : "Misconfigured user";
    }
  }

  // there's no good reason that this variable is a list at this point, but changing
  // it to a plain variable is too much change for the time being.
  public List<Role> getRoles() {
    Optional<Role> result = getRole();
    return result.isEmpty() ? List.of() : List.of(result.get());
  }

  public Optional<Role> getRole() {
    return Role.fromOrganizationRoles(wrapped.getRoles());
  }

  public UserStatus getStatus() {
    return wrapped.getUserStatus();
  }

  @Override
  public String getSuffix() {
    return wrapped.getNameInfo().getSuffix();
  }

  public boolean getIsDeleted() {
    return wrapped.getIsDeleted();
  }
}
