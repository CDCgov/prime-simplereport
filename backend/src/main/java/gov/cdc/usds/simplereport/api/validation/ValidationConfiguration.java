package gov.cdc.usds.simplereport.api.validation;

import graphql.kickstart.tools.boot.SchemaDirective;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ValidationConfiguration {

  @Bean
  public SchemaDirective lengthDirective() {
    return new SchemaDirective("length", new LengthDirective());
  }
}
