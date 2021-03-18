package gov.cdc.usds.simplereport.api.model.errors;

import graphql.ErrorClassification;
import graphql.ErrorType;
import graphql.GraphQLError;
import graphql.language.SourceLocation;
import java.util.List;

public class MissingPermissionsException extends RuntimeException implements GraphQLError {
  public MissingPermissionsException() {
    super("Current user does not have permission for this action", null, false, false);
  }

  @Override
  public ErrorClassification getErrorType() {
    return ErrorType.ExecutionAborted;
  }

  @Override
  public List<SourceLocation> getLocations() {
    return List.of();
  }
}
