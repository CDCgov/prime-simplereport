package gov.cdc.usds.simplereport.api.model.errors;

import graphql.ErrorClassification;
import graphql.ErrorType;
import graphql.GraphQLError;
import graphql.language.SourceLocation;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * Exception to throw when a TestEvent fails to serialize when saving to the ReportStream uploader
 * queue
 */
public class TestEventSerializationFailureException extends RuntimeException
    implements GraphQLError {

  private static final long serialVersionUID = 1L;

  public TestEventSerializationFailureException(
      UUID testEventId, String e, String reportingQueueName) {
    super(
        String.format(
            "TestEvent failed to serialize for %s with UUID %s: %s",
            reportingQueueName, testEventId, e));
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
