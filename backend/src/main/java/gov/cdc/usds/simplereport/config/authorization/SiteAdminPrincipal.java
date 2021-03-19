package gov.cdc.usds.simplereport.config.authorization;

import java.security.Principal;

/** A principal asserting that the bearer subject is a SimpleReport site administrator. */
public class SiteAdminPrincipal implements Principal {
  public static final String NAME = "SITE_ADMIN";

  @Override
  public String getName() {
    return NAME;
  }
}
