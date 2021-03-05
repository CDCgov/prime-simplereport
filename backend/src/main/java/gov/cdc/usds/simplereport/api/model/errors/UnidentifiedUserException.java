package gov.cdc.usds.simplereport.api.model.errors;

import graphql.ErrorClassification;
import graphql.ErrorType;
import graphql.GraphQLError;
import graphql.language.SourceLocation;
import java.util.List;

/** Exception to throw when a user can't be identified */
public class UnidentifiedUserException extends RuntimeException implements GraphQLError {

  private static final long serialVersionUID = 1L;

  public UnidentifiedUserException() {
    super("Cannot determine user's identity.");
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
