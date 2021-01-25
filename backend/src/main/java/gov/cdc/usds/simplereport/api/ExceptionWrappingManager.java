package gov.cdc.usds.simplereport.api;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.ExceptionHandler;

import graphql.GraphQLError;
import graphql.kickstart.spring.error.ThrowableGraphQLError;

/**
 * The GraphQL version of a ControllerAdvice component: tells the GraphQL
 * servlet which (presumably internal) exceptions should be caught and
 * re-wrapped or otherwise post-processed before they are allowed to bubble up
 * to the user.
 */
@Component
public class ExceptionWrappingManager {

    @ExceptionHandler(AccessDeniedException.class)
    public GraphQLError wrapSecurityExceptions(AccessDeniedException e) {
        return new ThrowableGraphQLError(e, "Current user does not have permission for this action");
    }

}
