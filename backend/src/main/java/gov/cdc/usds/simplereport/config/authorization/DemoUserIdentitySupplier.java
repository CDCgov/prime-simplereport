package gov.cdc.usds.simplereport.config.authorization;

import gov.cdc.usds.simplereport.config.simplereport.DemoUserConfiguration;
import gov.cdc.usds.simplereport.config.simplereport.DemoUserConfiguration.DemoUser;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;
import gov.cdc.usds.simplereport.service.model.IdentitySupplier;
import java.util.Collection;
import java.util.Map;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * An {@link IdentitySupplier} that looks up the username of the current authenticated (or, more
 * likely, "authenticated") user in the list of configured demo users. It is like that had we set
 * out to have this originally we would have ended up with a more conventional UserDetailsService,
 * and we could eventually work our way back there, but path-dependence produces weird results
 * sometimes.
 */
public class DemoUserIdentitySupplier implements IdentitySupplier {

  private static final Logger LOG = LoggerFactory.getLogger(DemoUserIdentitySupplier.class);

  private Map<String, IdentityAttributes> _userLookup;
  private IdentityAttributes _defaultIdentity;

  public DemoUserIdentitySupplier(DemoUserConfiguration config) {
    this(config.getAllUsers());
    DemoUser defaultUser = config.getDefaultUser();
    if (defaultUser != null) {
      _defaultIdentity = defaultUser.getIdentity();
    }
  }

  public DemoUserIdentitySupplier(Collection<DemoUser> wiredUsers) {
    _userLookup =
        wiredUsers.stream().collect(Collectors.toMap(DemoUser::getUsername, e -> e.getIdentity()));
  }

  @Override
  public IdentityAttributes get() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null) {
      throw new IllegalStateException("No authentication found");
    }
    if (!auth.isAuthenticated()) {
      LOG.info("Unauthenticated user in demo mode");
      return _defaultIdentity;
    }
    String name = auth.getName();
    IdentityAttributes user = _userLookup.get(name);
    if (user == null) {
      LOG.error("Invalid user {} in demo mode", name);
      user = _defaultIdentity;
    }
    return user;
  }
}
