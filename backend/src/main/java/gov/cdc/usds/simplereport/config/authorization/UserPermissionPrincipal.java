package gov.cdc.usds.simplereport.config.authorization;

import java.security.Principal;
import java.util.Objects;

/** A principal that represents a SimpleReport user permission. */
public final class UserPermissionPrincipal implements Principal {
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

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    UserPermissionPrincipal that = (UserPermissionPrincipal) o;
    return userPermission == that.userPermission;
  }

  @Override
  public int hashCode() {
    return Objects.hash(userPermission);
  }
}
