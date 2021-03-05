package gov.cdc.usds.simplereport.api.model.errors;

import graphql.ErrorClassification;
import graphql.ErrorType;
import graphql.GraphQLError;
import graphql.language.SourceLocation;
import java.util.Collection;
import java.util.List;

/**
 * An IllegalArgumentException that will be reported as such through the <code>errors</code> key of
 * the graphql response.
 */
public class IllegalGraphqlArgumentException extends IllegalArgumentException
    implements GraphQLError {

  private static final long serialVersionUID = 1L;

  public IllegalGraphqlArgumentException(String message) {
    super(message);
  }

  @Override // probably this could have been defaulted folks
  public List<SourceLocation> getLocations() {
    return null;
  }

  @Override // this can be customized, but is not discernably used in the output, so we might not
  // bother.
  public ErrorClassification getErrorType() {
    return ErrorType.ValidationError;
  }

  public static IllegalGraphqlArgumentException invalidInput(String input, String inputType) {
    return new IllegalGraphqlArgumentException(
        String.format("[%s] is not a valid %s", input, inputType));
  }

  public static IllegalGraphqlArgumentException mustBeEnumerated(
      String input, Collection<String> validInputs) {
    String message =
        String.format("\"%s\" must be one of [%s]", input, String.join(", ", validInputs));
    return new IllegalGraphqlArgumentException(message);
  }
}
