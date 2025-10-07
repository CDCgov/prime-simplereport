package gov.cdc.usds.simplereport.api.model;

import gov.cdc.usds.simplereport.api.model.facets.PersonWrapper;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.service.model.WrappedEntity;
import org.openapitools.client.model.UserStatus;

/** A wrapper class around APIUser, to return Okta-specific status information to GraphQL. */
public class ApiUserWithStatus extends WrappedEntity<ApiUser> implements PersonWrapper<ApiUser> {
  private UserStatus status;

  public ApiUserWithStatus(ApiUser user, UserStatus status) {
    super(user);
    this.status = status;
  }

  public UserStatus getStatus() {
    return status;
  }

  public String getEmail() {
    return wrapped.getLoginEmail();
  }

  public PersonName getNameInfo() {
    return wrapped.getNameInfo();
  }
}
