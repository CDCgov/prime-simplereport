package gov.cdc.usds.simplereport.config.authorization;

import gov.cdc.usds.simplereport.config.BeanProfiles;
import gov.cdc.usds.simplereport.config.FeatureFlagsConfig;
import gov.cdc.usds.simplereport.config.simplereport.DemoUserConfiguration;
import gov.cdc.usds.simplereport.config.simplereport.DemoUserConfiguration.DemoUser;
import gov.cdc.usds.simplereport.idp.repository.OktaRepository;
import gov.cdc.usds.simplereport.service.AuthorizationService;
import gov.cdc.usds.simplereport.service.DbOrgRoleClaimsService;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;
import gov.cdc.usds.simplereport.service.model.IdentitySupplier;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

@Configuration
@Profile(BeanProfiles.NO_SECURITY)
@ConditionalOnWebApplication
@Slf4j
public class DemoAuthenticationConfiguration {

  public static final String DEMO_AUTHORIZATION_FLAG = "SR-DEMO-LOGIN ";
  private static final String DEMO_BEARER_PREFIX = "Bearer " + DEMO_AUTHORIZATION_FLAG;

  private static String CACHED_USER_NAME;
  private static Authentication CACHED_AUTHENTICATION;

  /**
   * Creates and registers a {@link Filter} that runs before each request is processed by the
   * servlet. It checks for an Authorization header with a Bearer token that starts with {@link
   * #DEMO_AUTHORIZATION_FLAG}, and if it finds one it "logs in" a user with the username found in
   * the rest of that Authorization header. Interpreting the resulting {@link Authentication} is
   * expected to be the problem of the other beans created by this configuration class.
   */
  @Bean
  public FilterRegistrationBean<Filter> identityFilter() {
    Filter filter =
        (ServletRequest request, ServletResponse response, FilterChain chain) -> {
          SecurityContext securityContext = SecurityContextHolder.getContext();
          log.debug(
              "Processing request for demo authentication: current auth is {}",
              securityContext.getAuthentication());
          HttpServletRequest httpServletRequest = (HttpServletRequest) request;
          String authHeader = httpServletRequest.getHeader("Authorization");

          log.info("Auth type is {}, header is {}", httpServletRequest.getAuthType(), authHeader);
          if (authHeader != null && authHeader.startsWith(DEMO_BEARER_PREFIX)) {
            log.info("authHeader: {}", authHeader);
            String userName = authHeader.substring(DEMO_BEARER_PREFIX.length());

            if (!userName.equals(DemoAuthenticationConfiguration.CACHED_USER_NAME)) {
              DemoAuthenticationConfiguration.CACHED_USER_NAME = userName;
              DemoAuthenticationConfiguration.CACHED_AUTHENTICATION =
                  new TestingAuthenticationToken(userName, null, List.of());
              securityContext.setAuthentication(
                  DemoAuthenticationConfiguration.CACHED_AUTHENTICATION);
            }
          } else {
            DemoAuthenticationConfiguration.CACHED_USER_NAME = null;
            DemoAuthenticationConfiguration.CACHED_AUTHENTICATION = null;
          }
          chain.doFilter(request, response);
        };
    return new FilterRegistrationBean<>(filter);
  }

  @Bean
  public AuthorizationService getDemoAuthorizationService(
      OktaRepository oktaRepo,
      IdentitySupplier supplier,
      DemoUserConfiguration demoUserConfiguration,
      DbOrgRoleClaimsService dbOrgRoleClaimsService,
      FeatureFlagsConfig featureFlagsConfig) {
    return new DemoAuthorizationService(
        oktaRepo, supplier, demoUserConfiguration, dbOrgRoleClaimsService, featureFlagsConfig);
  }

  @Bean
  public IdentitySupplier getDemoIdentitySupplier(DemoUserConfiguration config) {
    return getCurrentDemoUserSupplier(config);
  }

  /**
   * Creates and returns a {@link IdentitySupplier} that examines the current security context,
   * finds the username of the current user, and returns the {@link IdentityAttributes} from the
   * {@link DemoUser} that matches that username. If a default user has been configured, that user
   * will be returned in the event that there is no username.
   *
   * <p>It is like that had we set out to have this originally we would have ended up with a more
   * conventional UserDetailsService, and we could eventually work our way back there, but
   * path-dependence produces weird results sometimes.
   *
   * @param config the configured list of DemoUsers, with or without a default user set.
   * @throws BadCredentialsException if a username is supplied but is invalid
   */
  public static IdentitySupplier getCurrentDemoUserSupplier(DemoUserConfiguration config) {
    return () -> {
      Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
      Authentication auth =
          authentication != null
              ? authentication
              : DemoAuthenticationConfiguration.CACHED_AUTHENTICATION;
      DemoUser found;
      if (auth == null) { // have to allow defaulting to work even when there is no authentication
        log.warn("No authentication found: current user will be default (if available)");
        found = config.getDefaultUser();
      } else if (auth instanceof AnonymousAuthenticationToken
          && DemoAuthenticationConfiguration.CACHED_USER_NAME == null) {
        log.info("Unauthenticated user in demo mode: current user will be default (if available)");
        found = config.getDefaultUser();
      } else {
        String cachedUserName = DemoAuthenticationConfiguration.CACHED_USER_NAME;
        String userName = auth.getName();

        DemoUser authUser = config.getByUsername(userName);
        DemoUser cachedUser = config.getByUsername(cachedUserName);
        found = authUser != null ? authUser : cachedUser;
        if (found == null) {
          log.error("Invalid user {} in demo mode", userName);
          throw new BadCredentialsException("Invalid username supplied.");
        }
      }
      return null != found ? found.getIdentity() : null;
    };
  }

  /**
   * An {@link AuthorizationService} that looks up the username of the current authenticated user in
   * the list of configured demo users, falling back to the default if one is configured, then looks
   * up that user in {@link OktaRepository} to find their authorization information.
   */
  public static class DemoAuthorizationService implements AuthorizationService {

    private final IdentitySupplier _getCurrentUser;
    private final OktaRepository _oktaRepo;
    private final Set<String> _adminGroupMemberSet;
    private final DbOrgRoleClaimsService _dbOrgRoleClaimsService;
    private final FeatureFlagsConfig _featureFlagsConfig;

    public DemoAuthorizationService(
        OktaRepository oktaRepo,
        IdentitySupplier getCurrent,
        DemoUserConfiguration demoUserConfiguration,
        DbOrgRoleClaimsService dbOrgRoleClaimsService,
        FeatureFlagsConfig featureFlagsConfig) {
      super();
      this._getCurrentUser = getCurrent;
      this._oktaRepo = oktaRepo;
      this._dbOrgRoleClaimsService = dbOrgRoleClaimsService;
      this._featureFlagsConfig = featureFlagsConfig;

      _adminGroupMemberSet =
          demoUserConfiguration.getSiteAdminEmails().stream()
              .collect(Collectors.toUnmodifiableSet());
    }

    @Override
    public List<OrganizationRoleClaims> findAllOrganizationRoles() {
      String username = Optional.ofNullable(_getCurrentUser.get()).orElseThrow().getUsername();
      Optional<OrganizationRoleClaims> claims =
          _oktaRepo.getOrganizationRoleClaimsForUser(username);
      List<OrganizationRoleClaims> oktaOrgRoleClaims =
          claims.isEmpty() ? List.of() : List.of(claims.get());
      if (!isSiteAdmin()) {
        if (_featureFlagsConfig.isOktaMigrationEnabled()) {
          List<OrganizationRoleClaims> dbOrgRoleClaims =
              _dbOrgRoleClaimsService.getOrganizationRoleClaims(username);
          return dbOrgRoleClaims;
        }
      }
      return oktaOrgRoleClaims;
    }

    @Override
    public boolean isSiteAdmin() {
      final IdentityAttributes identityAttributes = _getCurrentUser.get();
      if (identityAttributes == null) {
        return false;
      }
      final String userEmail = identityAttributes.getUsername();
      return _adminGroupMemberSet.contains(userEmail);
    }
  }

  @Bean
  public static TenantDataAuthenticationProvider getTenantDataAuthenticationProvider() {
    return (String username, Authentication currentAuth, Set<GrantedAuthority> authorities) ->
        new TestingAuthenticationToken(username, null, new ArrayList<>(authorities));
  }
}
