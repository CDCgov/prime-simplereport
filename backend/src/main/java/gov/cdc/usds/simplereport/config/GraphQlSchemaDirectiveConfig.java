package gov.cdc.usds.simplereport.config;

import gov.cdc.usds.simplereport.api.DefaultArgumentValidation;
import gov.cdc.usds.simplereport.api.directives.RequiredPermissionsDirectiveWiring;
import gov.cdc.usds.simplereport.config.scalars.LocalDateScalar;
import gov.cdc.usds.simplereport.config.scalars.UploadScalarType;
import graphql.scalars.ExtendedScalars;
import graphql.validation.rules.OnValidationErrorStrategy;
import graphql.validation.rules.ValidationRules;
import graphql.validation.schemawiring.ValidationSchemaWiring;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.graphql.execution.RuntimeWiringConfigurer;

@Configuration
public class GraphQlSchemaDirectiveConfig {
  public static final String REQUIRED_PERMISSIONS_DIRECTIVE_NAME = "requiredPermissions";
  public static final int MAXIMUM_SIZE = 256;

  //  @Bean
  //  public SchemaDirective getRequiredPermissionsWiring() {
  //    return new SchemaDirective(
  //        REQUIRED_PERMISSIONS_DIRECTIVE_NAME, new RequiredPermissionsDirectiveWiring());
  //  }

  @Bean
  public RuntimeWiringConfigurer runtimeWiringConfigurer() {
    return builder ->
        builder
            .scalar(UploadScalarType.upload)
            .scalar(LocalDateScalar.LocalDate)
            .scalar(ExtendedScalars.DateTime)
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
