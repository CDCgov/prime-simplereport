package gov.cdc.usds.simplereport;

import gov.cdc.usds.simplereport.config.AuthorizationProperties;
import gov.cdc.usds.simplereport.config.BeanProfiles;
import gov.cdc.usds.simplereport.config.authorization.OrganizationExtractor;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@Profile(BeanProfiles.SERVER_DEBUG)
public class AuthTestController {
  private OrganizationExtractor _extractor;

  public AuthTestController(AuthorizationProperties p) {
    _extractor = new OrganizationExtractor(p);
  }

  @GetMapping("/authTest")
  public Object showMe(Authentication auth) {
    log.warn("Authentication is of class {}", auth.getClass().getCanonicalName());
    Object principal = auth.getPrincipal();
    log.warn("Principal is {}", principal);
    if (principal != null) {
      log.warn("Principal class is {}", principal.getClass());
    }
    if (principal instanceof OidcUser) {
      OidcUser user = OidcUser.class.cast(principal);
      log.warn("Available attributes are {}", user.getAttributes().keySet());
      return user;
    }
    if (principal instanceof Jwt) {
      return principal;
    }
    return auth;
  }

  @GetMapping("/authTest/orgRoles")
  public List<OrganizationRoleClaims> getRoles(Authentication auth) {
    return _extractor.convert(auth.getAuthorities());
  }

  @GetMapping("/authTest/authorities")
  public Collection<GrantedAuthority> getAuthorities(Authentication auth) {
    return Collections.unmodifiableCollection(auth.getAuthorities());
  }
}
