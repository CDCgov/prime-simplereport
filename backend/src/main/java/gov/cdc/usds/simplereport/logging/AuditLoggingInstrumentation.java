package gov.cdc.usds.simplereport.logging;

import gov.cdc.usds.simplereport.config.authorization.ApiUserPrincipal;
import gov.cdc.usds.simplereport.config.authorization.FacilityPrincipal;
import gov.cdc.usds.simplereport.config.authorization.OrganizationPrincipal;
import gov.cdc.usds.simplereport.config.authorization.SiteAdminPrincipal;
import gov.cdc.usds.simplereport.config.authorization.UserPermission;
import gov.cdc.usds.simplereport.db.model.auxiliary.GraphQlInputs;
import gov.cdc.usds.simplereport.db.model.auxiliary.HttpRequestDetails;
import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.AuditService;
import graphql.ExecutionResult;
import graphql.GraphQLContext;
import graphql.execution.instrumentation.InstrumentationContext;
import graphql.execution.instrumentation.InstrumentationState;
import graphql.execution.instrumentation.SimpleInstrumentation;
import graphql.execution.instrumentation.SimpleInstrumentationContext;
import graphql.execution.instrumentation.parameters.InstrumentationExecutionParameters;
import java.security.Principal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;
import javax.security.auth.Subject;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.server.WebGraphQlRequest;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class AuditLoggingInstrumentation extends SimpleInstrumentation {

  public static final String WEB_GRAPHQL_REQUEST_KEY = "WebGraphQlRequest";
  public static final String SUBJECT_KEY = "Subject";
  private final AuditService _auditService;
  private final ApiUserService apiUserService;

  public AuditLoggingInstrumentation(AuditService service, ApiUserService apiUserService) {
    _auditService = service;
    this.apiUserService = apiUserService;
  }

  @Override
  public InstrumentationState createState() {
    GraphqlQueryState state = new GraphqlQueryState();
    log.trace("Creating state={} for audit", state);
    return state;
  }

  //  /*

  @Override
  @SuppressWarnings("checkstyle:IllegalCatch")
  public InstrumentationContext<ExecutionResult> beginExecution(
      InstrumentationExecutionParameters parameters) {
    String executionId = parameters.getExecutionInput().getExecutionId().toString();
    log.trace("Instrumenting query executionId={} for audit", executionId);
    try {
      GraphQLContext graphQLContext = parameters.getGraphQLContext();
      WebGraphQlRequest webGraphQlRequest = graphQLContext.get(WEB_GRAPHQL_REQUEST_KEY);
      Subject subject = graphQLContext.get(SUBJECT_KEY);
      if (subject == null) {
        subject = subjectFromCurrentUser();
      }
      GraphqlQueryState state = parameters.getInstrumentationState();
      state.setRequestId(executionId);

      if (webGraphQlRequest != null) {
        state.setHttpDetails(new HttpRequestDetails(webGraphQlRequest));
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
  //   */

  private Subject subjectFromCurrentUser() {
    var currentUser = apiUserService.getCurrentUserInfo();
    var principals = new HashSet<Principal>();

    principals.add(new ApiUserPrincipal(currentUser.getWrapped()));

    if (currentUser.getIsAdmin()) {
      principals.add(SiteAdminPrincipal.getInstance());
    }

    principals.addAll(currentUser.getPermissions());
    principals.addAll(currentUser.getRoles());

    currentUser.getOrganization().map(OrganizationPrincipal::new).ifPresent(principals::add);

    currentUser.getFacilities().stream().map(FacilityPrincipal::new).forEach(principals::add);

    return new Subject(true, principals, Collections.emptySet(), Collections.emptySet());
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
        throw e;
      }
    }
  }
}
