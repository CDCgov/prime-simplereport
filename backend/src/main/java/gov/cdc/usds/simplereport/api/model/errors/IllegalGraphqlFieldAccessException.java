package gov.cdc.usds.simplereport.api.model.errors;

import graphql.ErrorClassification;
import graphql.ErrorType;
import graphql.GraphQLError;
import graphql.language.SourceLocation;
import java.util.List;

public class IllegalGraphqlFieldAccessException extends RuntimeException implements GraphQLError {
  private final List<SourceLocation> sourceLocations;
  private final List<Object> path;

  public IllegalGraphqlFieldAccessException(
      String message, List<SourceLocation> sourceLocations, List<Object> path) {
    super(message, null, false, false);
    this.sourceLocations = List.copyOf(sourceLocations);
    this.path = List.copyOf(path);
  }

  @Override
  public ErrorClassification getErrorType() {
    return ErrorType.ExecutionAborted;
  }

  @Override
  public List<SourceLocation> getLocations() {
    return sourceLocations;
  }

  @Override
  public List<Object> getPath() {
    return path;
  }
}
