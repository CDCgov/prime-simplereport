package gov.cdc.usds.simplereport.config.authorization;

import java.util.Set;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

@FunctionalInterface
public interface TenantDataAuthenticationProvider {

  Authentication generateToken(
      String username, Authentication currentAuth, Set<GrantedAuthority> authorities);
}
