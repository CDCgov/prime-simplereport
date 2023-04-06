package gov.cdc.usds.simplereport.logging;

import gov.cdc.usds.simplereport.config.authorization.ApiUserPrincipal;
import gov.cdc.usds.simplereport.config.authorization.FacilityPrincipal;
import gov.cdc.usds.simplereport.config.authorization.OrganizationPrincipal;
import gov.cdc.usds.simplereport.config.authorization.SiteAdminPrincipal;
import gov.cdc.usds.simplereport.service.ApiUserService;
import java.security.Principal;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import javax.security.auth.Subject;
import javax.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.server.WebGraphQlInterceptor;
import org.springframework.graphql.server.WebGraphQlRequest;
import org.springframework.graphql.server.WebGraphQlResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class GraphQlInterceptor implements WebGraphQlInterceptor {

  public static final String WEB_GRAPHQL_REQUEST_KEY = "WebGraphQlRequest";
  public static final String SUBJECT_KEY = "Subject";
  public static final String HTTP_SERVLET_REQUEST_KEY = "HttpServletRequest";
  public static final String HTTP_SERVLET_RESPONSE_KEY = "HttpServletResponse";
  private final ApiUserService apiUserService;

  @Override
  public Mono<WebGraphQlResponse> intercept(WebGraphQlRequest request, Chain chain) {
    HashMap<String, Object> contextMap = new HashMap<>();

    contextMap.put(WEB_GRAPHQL_REQUEST_KEY, request);
    contextMap.put(SUBJECT_KEY, subjectFromCurrentUser());

    ServletRequestAttributes servletRequestAttributes =
        (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

    if (servletRequestAttributes != null) {
      contextMap.put(HTTP_SERVLET_REQUEST_KEY, servletRequestAttributes.getRequest());

      HttpServletResponse response = servletRequestAttributes.getResponse();
      if (response != null) {
        contextMap.put(HTTP_SERVLET_RESPONSE_KEY, response);
      }
    }

    request.configureExecutionInput(
        (executionInput, builder) -> builder.graphQLContext(contextMap).build());
    return chain.next(request);
  }

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
