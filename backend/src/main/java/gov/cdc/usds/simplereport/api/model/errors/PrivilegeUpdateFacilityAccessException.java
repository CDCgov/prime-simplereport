package gov.cdc.usds.simplereport.api.model.errors;

import graphql.ErrorClassification;
import graphql.ErrorType;
import graphql.GraphQLError;
import graphql.language.SourceLocation;
import java.util.Collections;
import java.util.List;

/** Exception to throw when a facility ID can't be found in an organization query */
public class PrivilegeUpdateFacilityAccessException extends RuntimeException
    implements GraphQLError {

  private static final long serialVersionUID = 1L;

  public static final String PRIVILEGE_UPDATE_FACILITY_ACCESS_ERROR =
      "Operation must specify a list of facilities for the user to access or allow them access to all facilities";

  public PrivilegeUpdateFacilityAccessException() {
    super(PRIVILEGE_UPDATE_FACILITY_ACCESS_ERROR);
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
