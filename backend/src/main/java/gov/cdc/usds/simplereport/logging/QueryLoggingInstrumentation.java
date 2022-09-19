package gov.cdc.usds.simplereport.logging;

import static gov.cdc.usds.simplereport.logging.GraphQlInterceptor.HTTP_SERVLET_REQUEST_KEY;
import static gov.cdc.usds.simplereport.logging.GraphQlInterceptor.HTTP_SERVLET_RESPONSE_KEY;

import com.microsoft.applicationinsights.TelemetryClient;
import com.microsoft.applicationinsights.telemetry.RequestTelemetry;
import graphql.ExecutionResult;
import graphql.execution.instrumentation.InstrumentationContext;
import graphql.execution.instrumentation.SimpleInstrumentation;
import graphql.execution.instrumentation.parameters.InstrumentationExecutionParameters;
import graphql.execution.instrumentation.parameters.InstrumentationValidationParameters;
import graphql.language.Field;
import graphql.language.OperationDefinition;
import graphql.validation.ValidationError;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;

/** Created by nickrobison on 11/27/20 */
@Component
@Slf4j
public class QueryLoggingInstrumentation extends SimpleInstrumentation {

  private final TelemetryClient client;
  private final boolean isDebugEnabled;

  public QueryLoggingInstrumentation(TelemetryClient client) {
    this.client = client;
    this.isDebugEnabled = log.isDebugEnabled();
  }

  @Override
  public InstrumentationContext<List<ValidationError>> beginValidation(
      InstrumentationValidationParameters parameters) {
    if (isDebugEnabled) {
      // Descend through the GraphQL query and pull out the field names and variables from the
      // operation definitions
      final Set<String> fieldSet =
          parameters.getDocument().getDefinitions().stream()
              .filter(definition -> definition instanceof OperationDefinition)
              .flatMap(
                  definition ->
                      ((OperationDefinition) definition).getSelectionSet().getSelections().stream())
              .filter(selection -> selection instanceof Field)
              .flatMap(selection -> GraphQLLoggingHelpers.walkFields("", selection))
              .collect(Collectors.toSet());
      log.debug("Selecting fields: {}", fieldSet);
    }
    return super.beginValidation(parameters);
  }

  @Override
  public InstrumentationContext<ExecutionResult> beginExecution(
      InstrumentationExecutionParameters parameters) {
    final long queryStart = System.currentTimeMillis();
    final String executionId = parameters.getExecutionInput().getExecutionId().toString();
    // Add the execution ID to the sfl4j MDC and the response headers
    MDC.put(LoggingConstants.REQUEST_ID_MDC_KEY, executionId);

    // Create a new Azure Telemetry Event
    final RequestTelemetry requestTelemetry = new RequestTelemetry();
    requestTelemetry.setId(executionId);

    HttpServletResponse httpServletResponse =
        parameters.getGraphQLContext().get(HTTP_SERVLET_RESPONSE_KEY);
    HttpServletRequest httpServletRequest =
        parameters.getGraphQLContext().get(HTTP_SERVLET_REQUEST_KEY);

    if (httpServletResponse != null) {
      httpServletResponse.setHeader(LoggingConstants.REQUEST_ID_HEADER, executionId);
    }

    if (httpServletRequest != null) {
      final String frontendAppInsightsSessionId = httpServletRequest.getHeader("x-ms-session-id");
      requestTelemetry.getContext().getSession().setId(frontendAppInsightsSessionId);
    }

    // Try to get the operation name, if one exists
    final String name = parameters.getExecutionInput().getOperationName();
    if (name == null || "".equals(name)) {
      log.warn("Anonymous GraphQL operation submitted, we'll be missing interesting data");
    } else {
      requestTelemetry.setName(name);
    }
    log.trace("Done initializing graphql query logging.");
    return GraphQLLoggingHelpers.createInstrumentationContext(queryStart, client, requestTelemetry);
  }
}
