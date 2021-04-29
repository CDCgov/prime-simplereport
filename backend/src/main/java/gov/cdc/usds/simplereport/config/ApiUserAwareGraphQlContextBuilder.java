package gov.cdc.usds.simplereport.config;

import gov.cdc.usds.simplereport.config.authorization.ApiUserPrincipal;
import gov.cdc.usds.simplereport.config.authorization.FacilityPrincipal;
import gov.cdc.usds.simplereport.config.authorization.OrganizationPrincipal;
import gov.cdc.usds.simplereport.config.authorization.SiteAdminPrincipal;
import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.dataloader.DataLoaderRegistryBuilder;
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
import org.springframework.stereotype.Component;

/**
 * A GraphQL context builder that injects the current API user as the context's subject. The subject
 * is populated with the user's granted permissions, whether the user is a site admin, the user's
 * granted roles, and the organization and facilities to which the user has been granted access.
 */
@Component
class ApiUserAwareGraphQlContextBuilder implements GraphQLServletContextBuilder {
  private final ApiUserService apiUserService;
  private final DataLoaderRegistryBuilder dataLoaderRegistryBuilder;

  ApiUserAwareGraphQlContextBuilder(
      ApiUserService apiUserService, DataLoaderRegistryBuilder dataLoaderRegistryBuilder) {
    this.apiUserService = apiUserService;
    this.dataLoaderRegistryBuilder = dataLoaderRegistryBuilder;
  }

  @Override
  public GraphQLContext build(
      HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) {
    return DefaultGraphQLServletContext.createServletContext()
        .with(httpServletRequest)
        .with(httpServletResponse)
        .with(subjectFromCurrentUser())
        .with(dataLoaderRegistryBuilder.build())
        .build();
  }

  @Override
  public GraphQLContext build(Session session, HandshakeRequest handshakeRequest) {
    return DefaultGraphQLWebSocketContext.createWebSocketContext()
        .with(session)
        .with(handshakeRequest)
        .with(subjectFromCurrentUser())
        .with(dataLoaderRegistryBuilder.build())
        .build();
  }

  @Override
  public GraphQLContext build() {
    return new DefaultGraphQLContext(dataLoaderRegistryBuilder.build(), subjectFromCurrentUser());
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
