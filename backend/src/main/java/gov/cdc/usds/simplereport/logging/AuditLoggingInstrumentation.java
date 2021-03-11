package gov.cdc.usds.simplereport.logging;

import gov.cdc.usds.simplereport.db.model.auxiliary.GraphQlInputs;
import gov.cdc.usds.simplereport.db.model.auxiliary.HttpRequestDetails;
import gov.cdc.usds.simplereport.service.AuditService;
import graphql.ExecutionResult;
import graphql.GraphQLError;
import graphql.execution.instrumentation.InstrumentationContext;
import graphql.execution.instrumentation.InstrumentationState;
import graphql.execution.instrumentation.SimpleInstrumentation;
import graphql.execution.instrumentation.SimpleInstrumentationContext;
import graphql.execution.instrumentation.parameters.InstrumentationExecutionParameters;
import graphql.kickstart.servlet.context.GraphQLServletContext;
import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class AuditLoggingInstrumentation extends SimpleInstrumentation {

  private static final Logger LOG = LoggerFactory.getLogger(AuditLoggingInstrumentation.class);

  private final AuditService _auditService;

  public AuditLoggingInstrumentation(AuditService service) {
    _auditService = service;
  }

  @Override
  public InstrumentationState createState() {
    GraphqlQueryState state = new GraphqlQueryState();
    LOG.debug("Creating state={} for audit", state);
    return state;
  }

  @Override
  public InstrumentationContext<ExecutionResult> beginExecution(
      InstrumentationExecutionParameters parameters) {
    String executionId = parameters.getExecutionInput().getExecutionId().toString();
    LOG.debug("Instrumenting query executionId={} for audit", executionId);
    GraphQLServletContext context = parameters.getContext();
    GraphqlQueryState state = parameters.getInstrumentationState();
    state.setRequestId(executionId);
    state.setHttpDetails(new HttpRequestDetails(context.getHttpServletRequest()));
    state.setGraphqlDetails(
        new GraphQlInputs(
            parameters.getOperation(), parameters.getQuery(), parameters.getVariables()));
    return new ExecutionResultContext(state);
  }

  private class /* not static! */ ExecutionResultContext
      extends SimpleInstrumentationContext<ExecutionResult> {

    private GraphqlQueryState state;

    public ExecutionResultContext(GraphqlQueryState state) {
      this.state = state;
    }

    @Override
    public void onCompleted(ExecutionResult result, Throwable t) {
      LOG.trace("End of execution, audit entry being saved.");
      List<String> errorPaths =
          result.getErrors().stream()
              .map(GraphQLError::getPath)
              .flatMap(List::stream)
              .map(Object::toString)
              .collect(Collectors.toList());
      _auditService.logGraphQlEvent(state, errorPaths);
    }
  }
}
