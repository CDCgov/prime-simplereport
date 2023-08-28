package gov.cdc.usds.simplereport.api.model.errors;

import graphql.ErrorClassification;
import graphql.ErrorType;
import graphql.GraphQLError;
import graphql.language.SourceLocation;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/** Exception to throw when a facility ID can't be found in an organization query */
public class UnidentifiedFacilityException extends RuntimeException implements GraphQLError {

  private static final long serialVersionUID = 1L;

  public UnidentifiedFacilityException(Set<UUID> facilityIdsNotFound, String orgId) {
    super(
        "Facilities with id(s) "
            + facilityIdsNotFound.stream().toList()
            + " for org "
            + orgId
            + " weren't found. Check those facility id(s) exist in the specified organization");
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
