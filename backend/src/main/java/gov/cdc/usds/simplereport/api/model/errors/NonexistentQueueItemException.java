package gov.cdc.usds.simplereport.api.model.errors;

import graphql.ErrorClassification;
import graphql.ErrorType;
import graphql.GraphQLError;
import graphql.language.SourceLocation;
import java.util.List;

/**
 * Exception to throw when an operation is performed on a test order that does not exist or has
 * already been completed.
 */
public class NonexistentQueueItemException extends RuntimeException implements GraphQLError {

  private static final long serialVersionUID = 1L;

  public NonexistentQueueItemException() {
    super("This test has already been submitted.");
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
