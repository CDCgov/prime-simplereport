package gov.cdc.usds.simplereport.api.model.errors;

import graphql.ErrorClassification;
import graphql.ErrorType;
import graphql.GraphQLError;
import graphql.language.SourceLocation;
import java.util.List;

/** A customizable error thrown by GraphqlQl for generic reasons */
public class GenericGraphqlException extends RuntimeException implements GraphQLError {

  public static final String GENERIC_ERROR_MESSAGE = "Something went wrong";
  private ErrorClassification errorType = ErrorType.DataFetchingException;
  private List<Object> errorPath;

  public GenericGraphqlException() {
    super(GENERIC_ERROR_MESSAGE);
  }

  public GenericGraphqlException(List<Object> errorPath) {
    super(GENERIC_ERROR_MESSAGE);
    this.errorPath = errorPath;
  }

  public GenericGraphqlException(String message, List<Object> errorPath) {
    super(message);
    this.errorPath = errorPath;
  }

  public GenericGraphqlException(String message, ErrorClassification errorType) {
    super(message);
    this.errorType = errorType;
  }

  @Override
  public List<SourceLocation> getLocations() {
    return List.of();
  }

  @Override
  public ErrorClassification getErrorType() {
    return errorType;
  }

  @Override
  public List<Object> getPath() {
    return this.errorPath;
  }

  @Override
  public String toString() {
    return super.getMessage();
  }
}
