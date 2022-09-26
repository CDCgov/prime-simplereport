package gov.cdc.usds.simplereport.config;

import static java.util.Collections.singletonList;

import gov.cdc.usds.simplereport.api.DefaultArgumentValidation;
import gov.cdc.usds.simplereport.api.directives.RequiredPermissionsDirectiveWiring;
import gov.cdc.usds.simplereport.api.model.errors.ConflictingUserException;
import gov.cdc.usds.simplereport.api.model.errors.GenericGraphqlException;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlFieldAccessException;
import gov.cdc.usds.simplereport.api.model.errors.NonexistentUserException;
import gov.cdc.usds.simplereport.config.scalars.datetime.DateTimeScalar;
import gov.cdc.usds.simplereport.config.scalars.localdate.LocalDateScalar;
import graphql.GraphQLError;
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

@Slf4j
@Configuration
public class GraphQlConfig {
  public static final String REQUIRED_PERMISSIONS_DIRECTIVE_NAME = "requiredPermissions";
  public static final int MAXIMUM_SIZE = 256;

  // mask all exception by default
  // to customize errors returned, you have to manually throw it here
  @Bean
  public DataFetcherExceptionResolver dataFetcherExceptionResolver() {
    return (exception, environment) -> {
      String errorPath = environment.getExecutionStepInfo().getPath().getSegmentName();

      log.error("Will replace the following exception with a GenericGraphqlException: ", exception);

      if (exception instanceof ConflictingUserException) {
        return Mono.just(singletonList((GraphQLError) exception));
      }

      if (exception instanceof AccessDeniedException) {
        return Mono.just(singletonList(new GenericGraphqlException("Unauthorized", errorPath)));
      }

      if (exception instanceof NonexistentUserException) {
        return Mono.just(
            singletonList(new GenericGraphqlException("Cannot find user.", errorPath)));
      }

      if (exception instanceof IllegalGraphqlArgumentException) {
        return Mono.just(
            singletonList(new GenericGraphqlException(exception.getMessage(), errorPath)));
      }

      if (exception instanceof IllegalGraphqlFieldAccessException) {
        return Mono.just(
            singletonList(new GenericGraphqlException(exception.getMessage(), errorPath)));
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
