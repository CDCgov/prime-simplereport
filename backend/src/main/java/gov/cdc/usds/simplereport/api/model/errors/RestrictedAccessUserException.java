package gov.cdc.usds.simplereport.api.model.errors;

import graphql.ErrorClassification;
import graphql.ErrorType;
import graphql.GraphQLError;
import graphql.language.SourceLocation;
import java.util.Collections;
import java.util.List;

/** Exception to throw when a user exists in the apiuser table but cannot be found in okta */
public class RestrictedAccessUserException extends RuntimeException implements GraphQLError {

  private static final long serialVersionUID = 1L;

  public RestrictedAccessUserException() {
    super("Site admin account cannot be accessed.");
  }

  @Override // should-be-defaulted unused interface method
  public List<SourceLocation> getLocations() {
    return Collections.emptyList();
  }

  @Override
  public ErrorClassification getErrorType() {
    return ErrorType.ExecutionAborted;
  }
}
