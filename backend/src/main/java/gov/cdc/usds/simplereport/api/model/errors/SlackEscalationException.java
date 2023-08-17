package gov.cdc.usds.simplereport.api.model.errors;

import graphql.ErrorClassification;
import graphql.ErrorType;
import graphql.GraphQLError;
import graphql.language.SourceLocation;
import java.io.IOException;
import java.util.Collections;
import java.util.List;

public class SlackEscalationException extends IOException implements GraphQLError {
  private static final long serialVersionUID = 1L;

  public SlackEscalationException() {
    super("Error in process sending a message to Slack.");
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
