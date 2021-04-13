package gov.cdc.usds.simplereport.config.authorization;

import gov.cdc.usds.simplereport.db.model.ApiUser;
import java.util.Objects;

/** A principal that represents the stored attributes of a SimpleReport user. */
public final class ApiUserPrincipal extends NamedPrincipal {
  private final ApiUser apiUser;

  public ApiUserPrincipal(ApiUser apiUser) {
    super("USER:" + apiUser.getLoginEmail());
    this.apiUser = apiUser;
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
