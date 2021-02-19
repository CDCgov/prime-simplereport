package gov.cdc.usds.simplereport.api.exceptions;

import java.util.List;

import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.http.HttpStatus;

import graphql.ErrorClassification;
import graphql.GraphQLError;
import graphql.language.SourceLocation;

@ResponseStatus(code = HttpStatus.UNAUTHORIZED, reason = "No patient link with the supplied ID was found, or the birth date provided was incorrect.")
public class InvalidPatientLinkException extends RuntimeException implements GraphQLError {
    private static final long serialVersionUID = 1L;

    public InvalidPatientLinkException() {
        super();
    }

    public InvalidPatientLinkException(String message) {
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
