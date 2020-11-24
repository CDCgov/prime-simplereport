package gov.cdc.usds.simplereport.api.model;

import graphql.ErrorClassification;
import graphql.GraphQLError;
import graphql.language.SourceLocation;

import java.util.List;

/**
 * Very simple way of passing an error message back to the client.
 */
public class SimpleTestGraphQLError extends RuntimeException implements GraphQLError {

  private final String message;

  public SimpleTestGraphQLError(String message) {
    super(message);
    this.message = message;
  }

  @Override
  public String getMessage() {
    return this.message;
  }

  @Override
  public List<SourceLocation> getLocations() {
    return null;
  }

  @Override
  public ErrorClassification getErrorType() {
    return null;
  }
}
