package gov.cdc.usds.simplereport.config.authorization;

import java.security.Principal;

/** A principal that represents a SimpleReport user permission. */
public class UserPermissionPrincipal implements Principal {
  private final UserPermission userPermission;

  public UserPermissionPrincipal(UserPermission userPermission) {
    this.userPermission = userPermission;
  }

  @Override
  public String getName() {
    return userPermission.name();
  }

  public UserPermission toUserPermission() {
    return userPermission;
  }
}
