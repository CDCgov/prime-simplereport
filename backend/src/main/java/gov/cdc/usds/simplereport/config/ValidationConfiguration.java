package gov.cdc.usds.simplereport.config;

import graphql.validation.rules.OnValidationErrorStrategy;
import graphql.validation.rules.ValidationRules;
import graphql.validation.schemawiring.ValidationSchemaWiring;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ValidationConfiguration {

  @Bean
  public ValidationSchemaWiring validationDirectives() {
    ValidationRules validationRules =
        ValidationRules.newValidationRules()
            .onValidationErrorStrategy(OnValidationErrorStrategy.RETURN_NULL)
            .build();

    return new ValidationSchemaWiring(validationRules);
  }
}
