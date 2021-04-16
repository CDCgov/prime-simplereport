package gov.cdc.usds.simplereport.service.model;

import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.DatabaseEntity;
import gov.cdc.usds.simplereport.db.model.PersonEntity;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import java.util.UUID;

public class UserIdentityInfo extends WrappedEntity<ApiUser>
    implements DatabaseEntity, PersonEntity {
  public UserIdentityInfo(UserInfo userInfo) {
    super(userInfo.getWrapped());
  }

  public UserIdentityInfo(final ApiUser apiUser) {
    super(apiUser);
  }

  @Override
  public UUID getInternalId() {
    return wrapped.getInternalId();
  }

  public String getEmail() {
    return wrapped.getLoginEmail();
  }

  @Override
  public PersonName getNameInfo() {
    return wrapped.getNameInfo();
  }
}
