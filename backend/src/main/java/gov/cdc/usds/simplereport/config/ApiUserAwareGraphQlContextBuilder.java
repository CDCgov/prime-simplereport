package gov.cdc.usds.simplereport.config;

import gov.cdc.usds.simplereport.config.authorization.SiteAdminPrincipal;
import gov.cdc.usds.simplereport.config.authorization.UserPermissionPrincipal;
import gov.cdc.usds.simplereport.service.ApiUserService;
import graphql.kickstart.execution.context.DefaultGraphQLContext;
import graphql.kickstart.execution.context.GraphQLContext;
import graphql.kickstart.servlet.context.DefaultGraphQLServletContext;
import graphql.kickstart.servlet.context.DefaultGraphQLWebSocketContext;
import graphql.kickstart.servlet.context.GraphQLServletContextBuilder;
import java.security.Principal;
import java.util.Collections;
import java.util.HashSet;
import javax.security.auth.Subject;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.websocket.Session;
import javax.websocket.server.HandshakeRequest;
import org.dataloader.DataLoaderRegistry;
import org.springframework.stereotype.Component;

@Component
class ApiUserAwareGraphQlContextBuilder implements GraphQLServletContextBuilder {
  private final ApiUserService apiUserService;

  ApiUserAwareGraphQlContextBuilder(ApiUserService apiUserService) {
    this.apiUserService = apiUserService;
  }

  @Override
  public GraphQLContext build(
      HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) {
    return DefaultGraphQLServletContext.createServletContext()
        .with(httpServletRequest)
        .with(httpServletResponse)
        .with(subjectFromCurrentUser())
        .build();
  }

  @Override
  public GraphQLContext build(Session session, HandshakeRequest handshakeRequest) {
    return DefaultGraphQLWebSocketContext.createWebSocketContext()
        .with(session)
        .with(handshakeRequest)
        .with(subjectFromCurrentUser())
        .build();
  }

  @Override
  public GraphQLContext build() {
    return new DefaultGraphQLContext(new DataLoaderRegistry(), subjectFromCurrentUser());
  }

  private Subject subjectFromCurrentUser() {
    var currentUser = apiUserService.getCurrentUserInfo();
    var principals = new HashSet<Principal>();

    if (currentUser.getIsAdmin()) {
      principals.add(new SiteAdminPrincipal());
    }

    currentUser.getPermissions().stream()
        .map(UserPermissionPrincipal::new)
        .forEach(principals::add);

    return new Subject(true, principals, Collections.emptySet(), Collections.emptySet());
  }
}
