package gov.cdc.usds.simplereport.api.model.errors;

import java.util.List;

import graphql.ErrorClassification;
import graphql.ErrorType;
import graphql.GraphQLError;
import graphql.language.SourceLocation;

/**
 * Exception to throw when a user can log in but cannot actually use the
 * application, for some reason (like having their organization deleted);
 * or when a user cannot be retrieved/edited because their organization
 * relationships are misconfigured.
 */
public class MisconfiguredUserException extends RuntimeException implements GraphQLError {

    private static final long serialVersionUID = 1L;

    public MisconfiguredUserException() {
        super("User is not configured correctly: user should be a member of exactly one organization.");
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
