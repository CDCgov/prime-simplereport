package gov.cdc.usds.simplereport.api.exceptions;

import java.util.List;

import graphql.ErrorClassification;
import graphql.GraphQLError;
import graphql.language.SourceLocation;

public class FeatureFlagDisabledException extends RuntimeException implements GraphQLError {

    /**
     *
     */
    private static final long serialVersionUID = 1L;

    public FeatureFlagDisabledException(String message) {
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
