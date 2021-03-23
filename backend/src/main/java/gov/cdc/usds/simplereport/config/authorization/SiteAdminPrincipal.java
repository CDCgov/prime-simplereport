package gov.cdc.usds.simplereport.config.authorization;

import java.security.Principal;
import java.util.Objects;

/** A principal asserting that the bearer subject is a SimpleReport site administrator. */
public final class SiteAdminPrincipal implements Principal {
  public static final String NAME = "SITE_ADMIN";
  private static final SiteAdminPrincipal INSTANCE = new SiteAdminPrincipal();

  private SiteAdminPrincipal() {}

  public static SiteAdminPrincipal getInstance() {
    return INSTANCE;
  }

  @Override
  public String getName() {
    return NAME;
  }
}
