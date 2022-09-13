package gov.cdc.usds.simplereport.api;

import graphql.GraphQLError;
//import graphql.kickstart.spring.error.ThrowableGraphQLError;
import graphql.GraphQLException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.ExceptionHandler;

/**
 * The GraphQL version of a ControllerAdvice component: tells the GraphQL servlet which (presumably
 * internal) exceptions should be caught and re-wrapped or otherwise post-processed before they are
 * allowed to bubble up to the user.
 */
@Component
public class ExceptionWrappingManager {

  @ExceptionHandler(AccessDeniedException.class)
  public GraphQLException wrapSecurityExceptions(AccessDeniedException e) {
    // Add This to `application-local.yaml` to debug what's gone wrong.
    // logging:
    //  level:
    //    org.springframework.security: TRACE
    return new GraphQLException("Current user does not have permission for this action", e);
  }
}
