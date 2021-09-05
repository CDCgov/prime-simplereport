package gov.cdc.usds.simplereport.config;

import gov.cdc.usds.simplereport.api.CurrentTenantDataAccessContextHolder;
import gov.cdc.usds.simplereport.api.model.errors.NonexistentUserException;
import gov.cdc.usds.simplereport.config.authorization.TenantDataAuthenticationProvider;
import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.AuthorizationService;
import java.io.IOException;
import java.util.Set;
import java.util.stream.Collectors;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class TenantDataAccessFilter implements Filter {

  @Autowired AuthorizationService _authService;
  @Autowired ApiUserService _apiUserService;
  @Autowired CurrentTenantDataAccessContextHolder _currentTenantDataAccessContextHolder;
  @Autowired TenantDataAuthenticationProvider _tenantDataAuthProvider;

  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
      throws IOException, ServletException {

    Authentication currentAuth = SecurityContextHolder.getContext().getAuthentication();

    try {
      if (currentAuth != null && _authService.isSiteAdmin()) {
        Set<String> authorities = _apiUserService.getTenantDataAccessAuthoritiesForCurrentUser();

        if (authorities.size() > 0) {
          Set<GrantedAuthority> grantedAuthorities =
              authorities.stream().map(SimpleGrantedAuthority::new).collect(Collectors.toSet());

          String username =
              _apiUserService.getCurrentApiUserInContainedTransaction().getLoginEmail();
          _currentTenantDataAccessContextHolder.setTenantDataAccessAuthorities(
              username, authorities);

          // overwrite authentication with a new token so that subsequent request processing
          // will see the authorities asserted by the active tenant data access rather than
          // the token passed with the request
          Authentication masqAuth =
              _tenantDataAuthProvider.generateToken(username, currentAuth, grantedAuthorities);

          SecurityContextHolder.getContext().setAuthentication(masqAuth);
        }
      }
    } catch (NonexistentUserException e) {
      // This is possible if a new admin is making their first request to the app.  In that
      // case, they will not have any tenant data access configured so it is okay to continue
    }

    chain.doFilter(request, response);
  }
}
