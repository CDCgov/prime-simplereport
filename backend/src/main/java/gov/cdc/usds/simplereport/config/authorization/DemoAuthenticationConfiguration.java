package gov.cdc.usds.simplereport.config.authorization;

import gov.cdc.usds.simplereport.config.BeanProfiles;
import gov.cdc.usds.simplereport.config.simplereport.DemoUserConfiguration;
import gov.cdc.usds.simplereport.config.simplereport.DemoUserConfiguration.DemoUser;
import gov.cdc.usds.simplereport.service.AuthorizationService;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;
import gov.cdc.usds.simplereport.service.model.IdentitySupplier;
import java.util.List;
import java.util.Optional;
import java.util.function.Supplier;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

@Configuration
@Profile(BeanProfiles.NO_SECURITY)
@ConditionalOnWebApplication
public class DemoAuthenticationConfiguration {

  public static final String DEMO_AUTHORIZATION_FLAG = "Bearer SR-DEMO-LOGIN ";

  private static final Logger LOG = LoggerFactory.getLogger(DemoAuthenticationConfiguration.class);

  /**
   * Creates and registers a {@link Filter} that runs before each request is processed by the
   * servlet. It checks for an Authorization header that starts with {@link
   * #DEMO_AUTHORIZATION_FLAG}, and if it finds one it "logs in" a user with the username found in
   * the rest of that Authorization header. Interpreting the resulting {@link Authentication} is
   * expected to be the problem of the other beans created by this configuration class.
   */
  @Bean
  public FilterRegistrationBean<Filter> identityFilter() {
    Filter filter =
        (ServletRequest request, ServletResponse response, FilterChain chain) -> {
          SecurityContext securityContext = SecurityContextHolder.getContext();
          LOG.info(
              "Filter happened via dev security: current auth is {}",
              securityContext.getAuthentication());
          HttpServletRequest req2 = (HttpServletRequest) request;
          String authHeader = req2.getHeader("Authorization");
          LOG.info("Auth type is {}, header is {}", req2.getAuthType(), authHeader);
          if (authHeader != null && authHeader.startsWith(DEMO_AUTHORIZATION_FLAG)) {
            LOG.trace("Parsing authorization header [{}]", authHeader);
            String userName = authHeader.substring(DEMO_AUTHORIZATION_FLAG.length());
            securityContext.setAuthentication(
                new TestingAuthenticationToken(userName, null, List.of()));
          }
          chain.doFilter(request, response);
        };
    return new FilterRegistrationBean<>(filter);
  }

  @Bean
  public AuthorizationService getDemoAuthorizationService(DemoUserConfiguration config) {
    return new DemoUserAuthorizationService(config);
  }

  @Bean
  public IdentitySupplier getDemoIdentitySupplier(DemoUserConfiguration config) {
    return new DemoUserIdentitySupplier(config);
  }

  /**
   * Creates and returns a {@link Supplier} that examines the current security context, finds the
   * username of the current user, and returns the {@link DemoUser} that matches that username. If a
   * default user has been configured, that user will be returned in the event that there is no
   * username or the username does not match any known DemoUser.
   *
   * @param config the configured list of DemoUsers, with or without a default user set.
   */
  private static Supplier<Optional<DemoUser>> getCurrentDemoUserSupplier(
      DemoUserConfiguration config) {
    return () -> {
      Authentication auth = SecurityContextHolder.getContext().getAuthentication();
      String userName = null;
      if (auth == null) { // have to allow defaulting to work even when there is no authentication
        LOG.warn("No authentication found: current user will be default (if available)");
      } else if (auth.isAuthenticated()) {
        userName = auth.getName();
      } else {
        LOG.info("Unauthenticated user in demo mode: current user will be default (if available)");
      }
      DemoUser found = config.getByUsername(userName);
      if (found == null) {
        LOG.error("Invalid user {} in demo mode", userName);
      }
      return Optional.ofNullable(found);
    };
  }

  /**
   * An {@link AuthorizationService} that looks up the username of the current authenticated user in
   * the list of configured demo users, falling back to the default if one is configured, and
   * returns the claims for that {@link DemoUser}. See {@link DemoUserIdentitySupplier} for snarky
   * comments about this idea.
   */
  public static class DemoUserAuthorizationService implements AuthorizationService {

    private final Supplier<Optional<DemoUser>> _getCurrentUser;

    public DemoUserAuthorizationService(DemoUserConfiguration config) {
      _getCurrentUser = getCurrentDemoUserSupplier(config);
    }

    @Override
    public List<OrganizationRoleClaims> findAllOrganizationRoles() {
      return _getCurrentUser.get().map(DemoUser::getAuthorization).map(List::of).orElse(List.of());
    }
  }

  /**
   * An {@link IdentitySupplier} that looks up the username of the current authenticated (or, more
   * likely, "authenticated") user in the list of configured demo users, falling back to the default
   * if one is configured. It is like that had we set out to have this originally we would have
   * ended up with a more conventional UserDetailsService, and we could eventually work our way back
   * there, but path-dependence produces weird results sometimes.
   */
  public static class DemoUserIdentitySupplier implements IdentitySupplier {

    private final Supplier<Optional<DemoUser>> _getCurrentUser;

    public DemoUserIdentitySupplier(DemoUserConfiguration config) {
      this._getCurrentUser = getCurrentDemoUserSupplier(config);
    }

    public DemoUserIdentitySupplier(List<DemoUser> wiredUsers) {
      this(new DemoUserConfiguration(wiredUsers));
    }

    @Override
    public IdentityAttributes get() {
      return _getCurrentUser.get().map(DemoUser::getIdentity).orElse(null);
    }
  }
}
