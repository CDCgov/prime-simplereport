package gov.cdc.usds.simplereport.config;

import gov.cdc.usds.simplereport.api.directives.RequiredPermissionsDirectiveWiring;
import graphql.kickstart.tools.boot.SchemaDirective;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GraphQlSchemaDirectiveConfig {
  public static final String REQUIRED_PERMISSIONS_DIRECTIVE_NAME = "requiredPermissions";

  @Bean
  public SchemaDirective getRequiredPermissionsWiring() {
    return new SchemaDirective(
        REQUIRED_PERMISSIONS_DIRECTIVE_NAME, new RequiredPermissionsDirectiveWiring());
  }
}
