package gov.cdc.usds.simplereport.api.directives;

import gov.cdc.usds.simplereport.config.authorization.UserAuthorizationVerifier;
import graphql.kickstart.tools.boot.SchemaDirective;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DirectiveConfig {
  @Bean
  public SchemaDirective getRequiredPermissionsWiring(
      UserAuthorizationVerifier userAuthorizationVerifier) {
    return new SchemaDirective(
        "requiredPermissions", new RequiredPermissionsDirectiveWiring(userAuthorizationVerifier));
  }
}
