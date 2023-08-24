package gov.cdc.usds.simplereport.api.model.errors;

import graphql.ErrorClassification;
import graphql.ErrorType;
import graphql.GraphQLError;
import graphql.language.SourceLocation;
import java.util.List;
import java.util.UUID;

/** Exception to throw when a facility ID can't be found in an organization query */
public class UnidentifiedFacilityException extends RuntimeException implements GraphQLError {

  private static final long serialVersionUID = 1L;

  public UnidentifiedFacilityException(List<UUID> facilityIdsNotFound, String orgId) {
    super(
        "Facilities with id(s) "
            + facilityIdsNotFound.toString()
            + " for org"
            + orgId
            + " weren't found. Check those facility id(s) exist in the specified organization");
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
