package gov.cdc.usds.simplereport.logging;

import com.microsoft.applicationinsights.TelemetryClient;
import com.microsoft.applicationinsights.telemetry.Duration;
import com.microsoft.applicationinsights.telemetry.RequestTelemetry;
import graphql.ExecutionResult;
import graphql.execution.instrumentation.InstrumentationContext;
import graphql.execution.instrumentation.SimpleInstrumentationContext;
import graphql.language.Field;
import graphql.language.Selection;
import graphql.language.SelectionSet;
import java.util.stream.Stream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;

/** Collection of helpers for parsing and logging the GraphQL queries and results */
public class GraphQLLoggingHelpers {

  private static final Logger LOG = LoggerFactory.getLogger(GraphQLLoggingHelpers.class);

  private GraphQLLoggingHelpers() {
    // Not used
  }

  /**
   * Recursive method for walking the GraphQL query structure and collecting the names of the fields
   * being selected, along with any provided arguments.
   *
   * <p>If a parent name is provided (e.g. not blank), it's used to provide some additional type
   * clarity to the output (e.g. patient:internalID) If the {@link Selection} object does not have
   * any sub-selections {@link Field#getSelectionSet()} is {@code null}, then it simply returns a
   * {@link Stream} of the single formatted field name
   *
   * @param parentName - {@link String} name of parent
   * @param selection - {@link Selection} to process
   * @return - {@link Stream} of field name {@link String} values
   */
  public static Stream<String> walkFields(String parentName, Selection<?> selection) {
    final Field field = (Field) selection;
    final String fieldName = field.getName();

    final SelectionSet selections = field.getSelectionSet();
    final String formattedFieldName;
    if (parentName.isBlank()) {
      formattedFieldName = fieldName;
    } else {
      formattedFieldName = String.format("%s.%s", parentName, fieldName);
    }
    if (selections == null) {
      return Stream.of(formattedFieldName);
    }

    return selections.getSelections().stream()
        .filter(s -> s instanceof Field)
        .flatMap(f -> GraphQLLoggingHelpers.walkFields(formattedFieldName, f));
  }

  /**
   * Create {@link InstrumentationContext} to handle cleanup and logging actions when the associated
   * Query completes Handles logging the exeuction time, query success/fail and any associated
   * errors
   *
   * @param queryStart - {@link Long} timestamp of when query started
   * @param client - {@link TelemetryClient} for submitting GraphQL requests to Azure
   * @param request - {@link RequestTelemetry} for tracking success/failure and duration
   * @return - {@link InstrumentationContext} to handle query completion
   */
  public static InstrumentationContext<ExecutionResult> createInstrumentationContext(
      long queryStart, TelemetryClient client, RequestTelemetry request) {
    return SimpleInstrumentationContext.whenCompleted(
        (ExecutionResult result, Throwable t) -> {
          LOG.trace("Entered logging instrumentation callback.");
          final long queryEnd = System.currentTimeMillis();
          final Duration queryDuration = new Duration(queryEnd - queryStart);
          request.setDuration(queryDuration);

          if (t != null) {
            LOG.error("GraphQL execution failed: {}", t.getMessage(), t);
            LOG.info("GraphQL execution FAILED in {}ms", queryDuration.getMilliseconds());
            request.setSuccess(false);
            client.trackException((Exception) t);
          } else if (!result.getErrors().isEmpty()) {
            result.getErrors().forEach(error -> LOG.error("Query failed with error {}", error));
            LOG.info("GraphQL execution FAILED in {}ms", queryDuration.getMilliseconds());
            request.setSuccess(false);
          } else {
            LOG.info("GraphQL execution COMPLETED in {}ms", queryDuration.getMilliseconds());
            request.setSuccess(true);
          }
          // Clear the MDC context
          MDC.remove(LoggingConstants.REQUEST_ID_MDC_KEY);
          client.trackRequest(request);
        });
  }
}
