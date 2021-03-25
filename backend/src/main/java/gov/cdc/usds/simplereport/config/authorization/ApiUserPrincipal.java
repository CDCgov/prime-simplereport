package gov.cdc.usds.simplereport.config.authorization;

import gov.cdc.usds.simplereport.db.model.ApiUser;
import java.security.Principal;
import java.util.Objects;

public final class ApiUserPrincipal implements Principal {
  private final ApiUser apiUser;

  public ApiUserPrincipal(ApiUser apiUser) {
    this.apiUser = Objects.requireNonNull(apiUser);
  }

  @Override
  public String getName() {
    return apiUser.getLoginEmail();
  }

  public ApiUser getApiUser() {
    return apiUser;
  }

  @Override
  public boolean equals(Object o) {
    return this == o
        || (o instanceof ApiUserPrincipal && apiUser.equals(((ApiUserPrincipal) o).apiUser));
  }

  @Override
  public int hashCode() {
    return Objects.hash(apiUser);
  }
}
