package gov.cdc.usds.simplereport.config;

import static java.util.Collections.singletonList;

import gov.cdc.usds.simplereport.api.DefaultArgumentValidation;
import gov.cdc.usds.simplereport.api.directives.RequiredPermissionsDirectiveWiring;
import gov.cdc.usds.simplereport.api.model.errors.ConflictingUserException;
import gov.cdc.usds.simplereport.api.model.errors.GenericGraphqlException;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlFieldAccessException;
import gov.cdc.usds.simplereport.api.model.errors.NonexistentUserException;
import gov.cdc.usds.simplereport.api.model.errors.OktaAccountUserException;
import gov.cdc.usds.simplereport.api.model.errors.RestrictedAccessUserException;
import gov.cdc.usds.simplereport.api.model.errors.TestEventSerializationFailureException;
import gov.cdc.usds.simplereport.config.scalars.datetime.DateTimeScalar;
import gov.cdc.usds.simplereport.config.scalars.localdate.LocalDateScalar;
import graphql.validation.rules.OnValidationErrorStrategy;
import graphql.validation.rules.ValidationRules;
import graphql.validation.schemawiring.ValidationSchemaWiring;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.graphql.execution.DataFetcherExceptionResolver;
import org.springframework.graphql.execution.RuntimeWiringConfigurer;
import org.springframework.security.access.AccessDeniedException;
import reactor.core.publisher.Mono;

/**
 * User-facing error message should be a String with the format of "header: $header; body: $body"
 * the `header:` and `body:` should be separated by a semicolon, which the frontend uses to split
 * the message. If this format is not used, the frontend will use a default header and body message
 */
@Slf4j
@Configuration
public class GraphQlConfig {
  public static final String REQUIRED_PERMISSIONS_DIRECTIVE_NAME = "requiredPermissions";
  public static final int MAXIMUM_SIZE = 256;

  private static final String defaultErrorBody = "body: Please check for errors and try again";

  // mask all exception by default
  // to customize errors returned, you have to manually throw it here
  @Bean
  public DataFetcherExceptionResolver dataFetcherExceptionResolver() {
    return (exception, environment) -> {
      String errorPath = environment.getExecutionStepInfo().getPath().getSegmentName();

      log.error("Will replace the following exception with a GenericGraphqlException: ", exception);

      if (exception instanceof ConflictingUserException) {
        String errorBody =
            "A user with this email already exists in our system. Please contact SimpleReport support for help.";
        String errorMessage = String.format("header: Can't add user; body: %s", errorBody);
        return Mono.just(singletonList(new GenericGraphqlException(errorMessage, errorPath)));
      }

      if (exception instanceof AccessDeniedException) {
        String errorMessage = String.format("header: Unauthorized; %s", defaultErrorBody);
        return Mono.just(singletonList(new GenericGraphqlException(errorMessage, errorPath)));
      }

      if (exception instanceof NonexistentUserException) {
        String errorMessage = String.format("header: Cannot find user.; %s", defaultErrorBody);
        return Mono.just(singletonList(new GenericGraphqlException(errorMessage, errorPath)));
      }

      if (exception instanceof OktaAccountUserException) {
        String errorBody = "The user's account needs to be properly setup.";
        String errorMessage =
            String.format("header: User is not configured correctly; body: %s", errorBody);
        return Mono.just(singletonList(new GenericGraphqlException(errorMessage, errorPath)));
      }

      if (exception instanceof RestrictedAccessUserException) {
        String errorMessage =
            "header: Error finding user email; body: Please escalate this issue to the SimpleReport team.";
        return Mono.just(singletonList(new GenericGraphqlException(errorMessage, errorPath)));
      }

      if (exception instanceof IllegalGraphqlArgumentException) {
        String errorMessage =
            String.format("header: %s; %s", exception.getMessage(), defaultErrorBody);
        return Mono.just(singletonList(new GenericGraphqlException(errorMessage, errorPath)));
      }

      if (exception instanceof IllegalGraphqlFieldAccessException) {
        String errorMessage =
            String.format("header: %s; %s", exception.getMessage(), defaultErrorBody);
        return Mono.just(singletonList(new GenericGraphqlException(errorMessage, errorPath)));
      }

      if (exception instanceof TestEventSerializationFailureException) {
        String errorBody =
            "Sorry, our system was unable to report your test result. Please try"
                + " again, or reach out to support@simplereport.gov for help.";
        String errorMessage = String.format("header: Error submitting test; body: %s", errorBody);
        return Mono.just(singletonList(new GenericGraphqlException(errorMessage, errorPath)));
      }

      return Mono.just(singletonList(new GenericGraphqlException((errorPath))));
    };
  }

  @Bean
  public RuntimeWiringConfigurer runtimeWiringConfigurer() {
    // this adds the graphql-java-extended-validation and a max argument size of MAXIMUM_SIZE
    ValidationRules validationRules =
        ValidationRules.newValidationRules()
            .addRule(new DefaultArgumentValidation(MAXIMUM_SIZE))
            .onValidationErrorStrategy(OnValidationErrorStrategy.RETURN_NULL)
            .build();

    return builder ->
        builder
            .scalar(LocalDateScalar.LocalDate)
            .scalar(DateTimeScalar.DateTime)
            .directiveWiring(new RequiredPermissionsDirectiveWiring())
            .directiveWiring(new ValidationSchemaWiring(validationRules));
  }
}
