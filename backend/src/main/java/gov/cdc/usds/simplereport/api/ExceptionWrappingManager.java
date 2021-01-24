package gov.cdc.usds.simplereport.api;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.ExceptionHandler;

import graphql.GraphQLError;
import graphql.kickstart.spring.error.ThrowableGraphQLError;

@Component
public class ExceptionWrappingManager {

    // this needs to be enabled and we have intentionally not done that yet so
    // so we can get tests working on this stuff
    // but at that point, set graphql.servlet.exception-handlers-enabled=true
    @ExceptionHandler(AccessDeniedException.class)
    public GraphQLError wrapSecurityExceptions(AccessDeniedException e) {
        // FIXME don't capitalize User that's weird
        return new ThrowableGraphQLError(e, "Current User does not have permission for this action");
    }

}
