package gov.cdc.usds.simplereport.config;

import gov.cdc.usds.simplereport.api.CurrentTenantDataAccessContextHolder;
import gov.cdc.usds.simplereport.api.model.errors.NonexistentUserException;
import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.AuthorizationService;
import java.io.IOException;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

@Component
@Profile("!" + BeanProfiles.NO_SECURITY)
public class TenantDataAccessFilter implements Filter {

  @Autowired AuthorizationService _authService;
  @Autowired ApiUserService _apiUserService;
  @Autowired CurrentTenantDataAccessContextHolder _currentTenantDataAccessContextHolder;

  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
      throws IOException, ServletException {

    Authentication currentAuth = SecurityContextHolder.getContext().getAuthentication();

    try {
      if (currentAuth != null && _authService.isSiteAdmin()) {
        Optional<Set<String>> permissions =
            _apiUserService.getTenantDataAccessAuthorityNamesForCurrentUser();

        if (permissions.isPresent()) {
          Set<GrantedAuthority> grantedAuthorities =
              permissions.get().stream()
                  .map(SimpleGrantedAuthority::new)
                  .collect(Collectors.toSet());

          _currentTenantDataAccessContextHolder.setTenantDataAccessAuthorities(
              currentAuth.getName(), permissions.get());

          Authentication masqAuth =
              new JwtAuthenticationToken((Jwt) currentAuth.getPrincipal(), grantedAuthorities);

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
