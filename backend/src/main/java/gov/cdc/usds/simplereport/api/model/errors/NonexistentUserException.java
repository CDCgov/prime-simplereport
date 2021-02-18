package gov.cdc.usds.simplereport.api.model.errors;

import java.util.List;

import graphql.ErrorClassification;
import graphql.ErrorType;
import graphql.GraphQLError;
import graphql.language.SourceLocation;

/**
 * Exception to throw when a user does not exist.
 */
public class NonexistentUserException extends RuntimeException implements GraphQLError {

    private static final long serialVersionUID = 1L;

    public NonexistentUserException() {
        super("Cannot find user.");
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
