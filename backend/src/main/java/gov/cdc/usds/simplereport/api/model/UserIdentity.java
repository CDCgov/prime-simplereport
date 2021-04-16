package gov.cdc.usds.simplereport.api.model;

import gov.cdc.usds.simplereport.api.model.facets.PersonWrapper;
import gov.cdc.usds.simplereport.service.model.UserIdentityInfo;
import gov.cdc.usds.simplereport.service.model.WrappedEntity;

public class UserIdentity extends WrappedEntity<UserIdentityInfo>
    implements PersonWrapper<UserIdentityInfo> {

  public UserIdentity(UserIdentityInfo userIdentityInfo) {
    super(userIdentityInfo);
  }

  // Note: we assume a user's email and login username are the same thing.
  public String getEmail() {
    return wrapped.getEmail();
  }
}
