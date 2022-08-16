package gov.cdc.usds.simplereport.logging;

import gov.cdc.usds.simplereport.config.authorization.ApiUserPrincipal;
import gov.cdc.usds.simplereport.config.authorization.FacilityPrincipal;
import gov.cdc.usds.simplereport.config.authorization.OrganizationPrincipal;
import gov.cdc.usds.simplereport.config.authorization.SiteAdminPrincipal;
import gov.cdc.usds.simplereport.service.ApiUserService;
import java.security.Principal;
import java.util.Collections;
import java.util.HashSet;
import java.util.Map;
import javax.security.auth.Subject;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.server.WebGraphQlInterceptor;
import org.springframework.graphql.server.WebGraphQlRequest;
import org.springframework.graphql.server.WebGraphQlResponse;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class GraphQlInterceptor implements WebGraphQlInterceptor {

  private final ApiUserService apiUserService;

  @Override
  public Mono<WebGraphQlResponse> intercept(WebGraphQlRequest request, Chain chain) {
    request.configureExecutionInput(
        (executionInput, builder) ->
            builder
                .graphQLContext(
                    Map.of(
                        AuditLoggingInstrumentation.WEB_GRAPHQL_REQUEST_KEY,
                        request,
                        AuditLoggingInstrumentation.SUBJECT_KEY,
                        subjectFromCurrentUser()))
                .build());

    return chain.next(request);
  }

  // lifted from ApiUserAwareGraphQlContextBuilder
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
}
