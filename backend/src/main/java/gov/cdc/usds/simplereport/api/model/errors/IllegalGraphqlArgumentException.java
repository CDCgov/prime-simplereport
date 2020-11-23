package gov.cdc.usds.simplereport.api.model.errors;

import java.util.List;

import graphql.ErrorClassification;
import graphql.ErrorType;
import graphql.GraphQLError;
import graphql.language.SourceLocation;

/**
 * An IllegalArgumentException that will be reported as such through the <code>errors</code> key of the
 * graphql response.
 */
public class IllegalGraphqlArgumentException extends IllegalArgumentException implements GraphQLError {

	private static final long serialVersionUID = 1L;

	public IllegalGraphqlArgumentException(String message) {
		super(message);
	}

	@Override // probably this could have been defaulted folks
	public List<SourceLocation> getLocations() {
		return null;
	}

	@Override // this can be customized, but is not discernably used in the output, so we might not bother.
	public ErrorClassification getErrorType() {
		return ErrorType.ValidationError;
	}

}
