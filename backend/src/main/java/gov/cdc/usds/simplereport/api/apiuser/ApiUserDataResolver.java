package gov.cdc.usds.simplereport.api.apiuser;

import gov.cdc.usds.simplereport.api.PersonNameResolver;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import org.springframework.stereotype.Component;

/**
 * Resolver for the "name" field of ApiUser, where ApiUser is the type with that name in the API,
 * and not the thing resolved by the ApiUserResolver. This may produce some confusion until/unless
 * we rename that class.
 */
@Component
public class ApiUserDataResolver implements PersonNameResolver<ApiUser> {}
