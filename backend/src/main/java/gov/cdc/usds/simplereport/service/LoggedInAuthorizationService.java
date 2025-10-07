package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.config.AuthorizationProperties;
import gov.cdc.usds.simplereport.config.BeanProfiles;
import gov.cdc.usds.simplereport.config.authorization.OrganizationExtractor;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import gov.cdc.usds.simplereport.config.authorization.TenantDataAuthenticationProvider;
import java.util.List;
import java.util.Set;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

/** Real-world implementation of AuthorizationService for IDP-integrated environments. */
@Component
@Profile("!" + BeanProfiles.NO_SECURITY)
public class LoggedInAuthorizationService implements AuthorizationService {

  private OrganizationExtractor _extractor;
  private AuthorizationProperties _authProperties;

  public LoggedInAuthorizationService(
      OrganizationExtractor extractor, AuthorizationProperties authProperties) {
    this._extractor = extractor;
    this._authProperties = authProperties;
  }

  private Authentication getCurrentAuth() {
    Authentication currentAuth = SecurityContextHolder.getContext().getAuthentication();
    if (currentAuth == null) {
      throw new RuntimeException("Nobody is currently authenticated");
    }
    return currentAuth;
  }

  @Override
  public List<OrganizationRoleClaims> findAllOrganizationRoles() {
    Authentication currentAuth = getCurrentAuth();
    return _extractor.convert(currentAuth.getAuthorities());
  }

  @Override
  public boolean isSiteAdmin() {
    Authentication currentAuth = getCurrentAuth();
    final String adminGroupName = _authProperties.getAdminGroupName();

    return currentAuth.getAuthorities().stream()
        .anyMatch(i -> adminGroupName.equals(i.getAuthority()));
  }

  @Bean
  public static TenantDataAuthenticationProvider getTenantDataAuthenticationProvider() {
    return (String username, Authentication currentAuth, Set<GrantedAuthority> authorities) ->
        new JwtAuthenticationToken((Jwt) currentAuth.getPrincipal(), authorities);
  }
}
