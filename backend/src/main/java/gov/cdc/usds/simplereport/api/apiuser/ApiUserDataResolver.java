package gov.cdc.usds.simplereport.api.apiuser;

import gov.cdc.usds.simplereport.api.InternalIdResolver;
import gov.cdc.usds.simplereport.api.PersonNameResolver;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import org.springframework.stereotype.Component;

/**
 * Resolver for the graphql ApiUser type, which just (currently) contains the name of the person who
 * last modified an entity; this resolver simply aliases nameInfo to name. You may be looking for
 * {@link UserResolver}, which provides access to a much more significant graph.
 */
@Component
public class ApiUserDataResolver
    implements InternalIdResolver<ApiUser>, PersonNameResolver<ApiUser> {
  public String getEmail(ApiUser user) {
    return user.getLoginEmail();
  }

  public String getFirstName(ApiUser user) {
    return user.getNameInfo().getFirstName();
  }

  public String getMiddleName(ApiUser user) {
    return user.getNameInfo().getMiddleName();
  }

  public String getLastName(ApiUser user) {
    return user.getNameInfo().getLastName();
  }

  public String getSuffix(ApiUser user) {
    return user.getNameInfo().getSuffix();
  }
}
