package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.config.BeanProfiles;
import gov.cdc.usds.simplereport.config.authorization.OrganizationExtractor;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import java.util.List;
import org.springframework.context.annotation.Profile;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/** Real-world implementation of AuthorizationService for IDP-integrated environments. */
@Component
@Profile("!" + BeanProfiles.NO_SECURITY)
public class LoggedInAuthorizationService implements AuthorizationService {

  private OrganizationExtractor _extractor;

  public LoggedInAuthorizationService(OrganizationExtractor extractor) {
    this._extractor = extractor;
  }

  @Override
  public List<OrganizationRoleClaims> findAllOrganizationRoles() {
    Authentication currentAuth = SecurityContextHolder.getContext().getAuthentication();
    if (currentAuth == null) {
      throw new RuntimeException("Nobody is currently authenticated");
    }
    return _extractor.convert(currentAuth.getAuthorities());
  }
}
