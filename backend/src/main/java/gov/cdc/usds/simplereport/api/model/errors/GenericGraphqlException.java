package gov.cdc.usds.simplereport.api.model.errors;

import graphql.ErrorClassification;
import graphql.ErrorType;
import graphql.GraphQLError;
import graphql.language.SourceLocation;
import java.util.Collections;
import java.util.List;

/** A customizable error thrown by GraphqlQl for generic reasons */
public class GenericGraphqlException extends RuntimeException implements GraphQLError {

  public static final String GENERIC_ERROR_MESSAGE =
      "header: Something went wrong; body: Please check for errors and try again";
  private final String errorPath;

  public GenericGraphqlException() {
    super(GENERIC_ERROR_MESSAGE);
    this.errorPath = null;
  }

  public GenericGraphqlException(String errorPath) {
    super(GENERIC_ERROR_MESSAGE);
    this.errorPath = errorPath;
  }

  public GenericGraphqlException(String message, String errorPath) {
    super(message);
    this.errorPath = errorPath;
  }

  @Override
  public List<SourceLocation> getLocations() {
    return List.of();
  }

  @Override
  public ErrorClassification getErrorType() {
    return ErrorType.ExecutionAborted;
  }

  @Override
  public List<Object> getPath() {
    return Collections.singletonList(errorPath);
  }

  @Override
  public String toString() {
    return super.getMessage();
  }
}
