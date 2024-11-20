package gov.cdc.usds.simplereport.logging;

import static gov.cdc.usds.simplereport.logging.GraphQlInterceptor.HTTP_SERVLET_REQUEST_KEY;
import static gov.cdc.usds.simplereport.logging.GraphQlInterceptor.SUBJECT_KEY;

import gov.cdc.usds.simplereport.api.model.errors.GenericGraphqlException;
import gov.cdc.usds.simplereport.config.authorization.ApiUserPrincipal;
import gov.cdc.usds.simplereport.config.authorization.OrganizationPrincipal;
import gov.cdc.usds.simplereport.config.authorization.SiteAdminPrincipal;
import gov.cdc.usds.simplereport.config.authorization.UserPermission;
import gov.cdc.usds.simplereport.db.model.auxiliary.GraphQlInputs;
import gov.cdc.usds.simplereport.db.model.auxiliary.HttpRequestDetails;
import gov.cdc.usds.simplereport.service.AuditService;
import graphql.ExecutionResult;
import graphql.GraphQLContext;
import graphql.execution.instrumentation.*;
import graphql.execution.instrumentation.parameters.InstrumentationCreateStateParameters;
import graphql.execution.instrumentation.parameters.InstrumentationExecutionParameters;
import jakarta.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import javax.security.auth.Subject;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class AuditLoggingInstrumentation extends SimplePerformantInstrumentation {
  private final AuditService _auditService;

  @Override
  public InstrumentationState createState(InstrumentationCreateStateParameters parameters) {
    GraphqlQueryState state = new GraphqlQueryState();
    log.trace("Creating state={} for audit", state);
    return state;
  }

  @Override
  @SuppressWarnings("checkstyle:IllegalCatch")
  public InstrumentationContext<ExecutionResult> beginExecution(
      InstrumentationExecutionParameters parameters, InstrumentationState instrumentationState) {
    String executionId = parameters.getExecutionInput().getExecutionId().toString();
    log.trace("Instrumenting query executionId={} for audit", executionId);
    try {
      GraphQLContext graphQLContext = parameters.getGraphQLContext();
      Subject subject = graphQLContext.get(SUBJECT_KEY);
      GraphqlQueryState state = (GraphqlQueryState) instrumentationState;
      state.setRequestId(executionId);

      HttpServletRequest httpServletRequest = graphQLContext.get(HTTP_SERVLET_REQUEST_KEY);
      if (httpServletRequest != null) {
        state.setHttpDetails(new HttpRequestDetails(httpServletRequest));
      }

      state.setGraphqlDetails(
          new GraphQlInputs(
              parameters.getOperation(), parameters.getQuery(), parameters.getVariables()));
      return new ExecutionResultContext(state, subject);
    } catch (Exception e) {
      // we don't 100% trust this error not to get swallowed by graphql-java
      log.error("Extremely unexpected error creating instrumentation state for audit", e);
      throw e;
    }
  }

  private class /* not static! */ ExecutionResultContext
      extends SimpleInstrumentationContext<ExecutionResult> {

    private final GraphqlQueryState state;
    private final Subject subject;

    public ExecutionResultContext(GraphqlQueryState state, Subject subject) {
      this.state = state;
      this.subject = subject;
    }

    @Override
    @SuppressWarnings("checkstyle:IllegalCatch")
    public void onCompleted(ExecutionResult result, Throwable t) {
      log.trace("End of execution, audit entry being saved.");
      List<String> errorPaths =
          result.getErrors().stream()
              .map(e -> e.getPath() == null ? Collections.emptyList() : e.getPath())
              .flatMap(List::stream)
              .map(Object::toString)
              .collect(Collectors.toList());
      try {
        _auditService.logGraphQlEvent(
            state,
            errorPaths,
            subject.getPrincipals(ApiUserPrincipal.class).stream()
                .findAny()
                .map(ApiUserPrincipal::getApiUser)
                .orElseThrow(),
            new ArrayList<>(subject.getPrincipals(UserPermission.class)),
            !subject.getPrincipals(SiteAdminPrincipal.class).isEmpty(),
            subject.getPrincipals(OrganizationPrincipal.class).stream()
                .map(OrganizationPrincipal::getOrganization)
                .findAny()
                .orElse(null));
      } catch (Exception e) {
        // we don't 100% trust this error not to get swallowed by graphql-java
        log.error("Unexpected error saving audit event", e);
        throw new GenericGraphqlException();
      }
    }
  }
}
