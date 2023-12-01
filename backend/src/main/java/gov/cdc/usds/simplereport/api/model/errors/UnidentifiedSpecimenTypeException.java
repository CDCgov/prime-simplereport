package gov.cdc.usds.simplereport.api.model.errors;

import graphql.ErrorClassification;
import graphql.ErrorType;
import graphql.GraphQLError;
import graphql.language.SourceLocation;
import java.util.Collections;
import java.util.List;

/** Exception to throw when a facility ID can't be found in an organization query */
public class UnidentifiedSpecimenTypeException extends RuntimeException implements GraphQLError {

  private static final long serialVersionUID = 1L;

  public UnidentifiedSpecimenTypeException(String typeCode) {
    super(
        "Specimen with type code "
            + typeCode
            + " weren't found. to make sure that type code exists");
  }

  @Override // should-be-defaulted unused interface method
  public List<SourceLocation> getLocations() {
    return Collections.emptyList();
  }

  @Override
  public ErrorClassification getErrorType() {
    return ErrorType.ExecutionAborted;
  }
}
