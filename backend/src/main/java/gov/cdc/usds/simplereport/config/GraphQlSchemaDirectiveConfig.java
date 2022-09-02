package gov.cdc.usds.simplereport.config;

import static java.util.Collections.singletonList;

import gov.cdc.usds.simplereport.api.DefaultArgumentValidation;
import gov.cdc.usds.simplereport.api.directives.RequiredPermissionsDirectiveWiring;
import gov.cdc.usds.simplereport.api.model.errors.ConflictingUserException;
import gov.cdc.usds.simplereport.api.model.errors.GenericGraphqlException;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlFieldAccessException;
import gov.cdc.usds.simplereport.api.model.errors.NonexistentUserException;
import gov.cdc.usds.simplereport.config.scalars.UploadScalarType;
import gov.cdc.usds.simplereport.config.scalars.datetime.DateTimeScalar;
import gov.cdc.usds.simplereport.config.scalars.localdate.LocalDateScalar;
import graphql.GraphQLError;
import graphql.validation.rules.OnValidationErrorStrategy;
import graphql.validation.rules.ValidationRules;
import graphql.validation.schemawiring.ValidationSchemaWiring;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.graphql.execution.DataFetcherExceptionResolver;
import org.springframework.graphql.execution.RuntimeWiringConfigurer;
import org.springframework.security.access.AccessDeniedException;
import reactor.core.publisher.Mono;

@Configuration
public class GraphQlSchemaDirectiveConfig {
  public static final String REQUIRED_PERMISSIONS_DIRECTIVE_NAME = "requiredPermissions";
  public static final int MAXIMUM_SIZE = 256;

  //  @Bean
  //  public SchemaDirective getRequiredPermissionsWiring() {
  //    return new SchemaDirective(
  //        REQUIRED_PERMISSIONS_DIRECTIVE_NAME, new RequiredPermissionsDirectiveWiring());
  //  }

  // graphql masks all exception by default
  // https://docs.spring.io/spring-graphql/docs/current/reference/html/#execution-exceptions
  // by default there are 5 categories BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, NOT_FOUND,
  // INTERNAL_ERROR
  // to customize errors returned, you have to manually throw it here
  @Bean
  public DataFetcherExceptionResolver dataFetcherExceptionResolver() {
    return (exception, environment) -> {
      String errorPath = environment.getExecutionStepInfo().getPath().getSegmentName();

      if (exception instanceof ConflictingUserException) {
        return Mono.just(singletonList((GraphQLError) exception));
      }

      if (exception instanceof AccessDeniedException) {
        return Mono.just(
            singletonList(new GenericGraphqlException("Unauthorized", singletonList(errorPath))));
      }

      if (exception instanceof NonexistentUserException) {
        return Mono.just(
            singletonList(
                new GenericGraphqlException("Cannot find user.", singletonList(errorPath))));
      }

      if (exception instanceof IllegalGraphqlArgumentException) {
        return Mono.just(singletonList((GraphQLError) exception));
      }

      if (exception instanceof IllegalGraphqlFieldAccessException) {
        return Mono.just(singletonList((GraphQLError) exception));
      }

      return null;
    };
  }

  @Bean
  public RuntimeWiringConfigurer runtimeWiringConfigurer() {
    return builder ->
        builder
            .scalar(UploadScalarType.upload)
            .scalar(LocalDateScalar.LocalDate)
            .scalar(DateTimeScalar.DateTime)
            //            .scalar(ExtendedScalars.UUID);
            .directiveWiring(new RequiredPermissionsDirectiveWiring());
  }

  @Bean
  public ValidationSchemaWiring validationDirectives() {
    ValidationRules validationRules =
        ValidationRules.newValidationRules()
            .addRule(new DefaultArgumentValidation(MAXIMUM_SIZE))
            .onValidationErrorStrategy(OnValidationErrorStrategy.RETURN_NULL)
            .build();

    return new ValidationSchemaWiring(validationRules);
  }
}
