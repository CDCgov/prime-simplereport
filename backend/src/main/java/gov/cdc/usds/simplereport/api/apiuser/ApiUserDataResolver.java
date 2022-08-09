package gov.cdc.usds.simplereport.api.apiuser;

import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

/**
 * Resolver for the graphql ApiUser type, which just (currently) contains the name of the person who
 * last modified an entity; this resolver simply aliases nameInfo to name. You may be looking for
 * {@link UserResolver}, which provides access to a much more significant graph.
 */
@Controller
public class ApiUserDataResolver {
  @SchemaMapping(typeName = "ApiUser", field = "email")
  public String getEmail(ApiUser user) {
    return user.getLoginEmail();
  }

  @SchemaMapping(typeName = "ApiUser", field = "firstName")
  public String getFirstName(ApiUser user) {
    return user.getNameInfo().getFirstName();
  }

  @SchemaMapping(typeName = "ApiUser", field = "middleName")
  public String getMiddleName(ApiUser user) {
    return user.getNameInfo().getMiddleName();
  }

  @SchemaMapping(typeName = "ApiUser", field = "lastName")
  public String getLastName(ApiUser user) {
    return user.getNameInfo().getLastName();
  }

  @SchemaMapping(typeName = "ApiUser", field = "suffix")
  public String getSuffix(ApiUser user) {
    return user.getNameInfo().getSuffix();
  }

  @SchemaMapping(typeName = "ApiUser", field = "name")
  public PersonName getName(ApiUser user) {
    return user.getNameInfo();
  }
}
