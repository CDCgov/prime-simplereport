package gov.cdc.usds.simplereport.api.model.errors;

import graphql.ErrorClassification;
import graphql.ErrorType;
import graphql.GraphQLError;
import graphql.language.SourceLocation;
import java.util.List;

/** Exception to throw when a user can't be added because of a conflict */
public class ConflictingUserException extends RuntimeException implements GraphQLError {

  private static final long serialVersionUID = 1L;

  public ConflictingUserException() {
    super("A user with this email address already exists.");
  }

  @Override // should-be-defaulted unused interface method
  public List<SourceLocation> getLocations() {
    return null;
  }

  @Override
  public ErrorClassification getErrorType() {
    return ErrorType.ExecutionAborted;
  }
}
