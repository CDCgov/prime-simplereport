package gov.cdc.usds.simplereport.api.model;

import gov.cdc.usds.simplereport.api.model.facets.PersonWrapper;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.service.model.WrappedEntity;

public class UserIdentity extends WrappedEntity<ApiUser> implements PersonWrapper<ApiUser> {

  public UserIdentity(ApiUser apiUser) {
    super(apiUser);
  }

  // Note: we assume a user's email and login username are the same thing.
  public String getEmail() {
    return wrapped.getLoginEmail();
  }
}
