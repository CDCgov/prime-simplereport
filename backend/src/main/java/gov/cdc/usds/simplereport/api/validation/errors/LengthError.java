package gov.cdc.usds.simplereport.api.validation.errors;

import graphql.ErrorType;
import graphql.GraphQLError;
import graphql.language.SourceLocation;
import java.util.ArrayList;
import java.util.List;

public class LengthError implements GraphQLError {

  private final String fieldName;
  private final int minimumLength;
  private final int maximumLength;

  public LengthError(String fieldName, int minimumLength, int maximumLength) {
    this.fieldName = fieldName;
    this.minimumLength = minimumLength;
    this.maximumLength = maximumLength;
  }

  @Override
  public String getMessage() {
    return String.format(
        "%s: length is invalid (expected %d <= len <= %d)",
        fieldName, minimumLength, maximumLength);
  }

  @Override
  public List<SourceLocation> getLocations() {
    return new ArrayList<>();
  }

  @Override
  public ErrorType getErrorType() {
    return ErrorType.ValidationError;
  }
}
