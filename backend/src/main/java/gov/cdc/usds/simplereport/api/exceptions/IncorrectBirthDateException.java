package gov.cdc.usds.simplereport.api.exceptions;

import java.util.List;

import graphql.ErrorClassification;
import graphql.GraphQLError;
import graphql.language.SourceLocation;

public class IncorrectBirthDateException extends RuntimeException implements GraphQLError {

    /**
     *
     */
    private static final long serialVersionUID = 1L;

    public IncorrectBirthDateException(String message) {
        super(message);

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
