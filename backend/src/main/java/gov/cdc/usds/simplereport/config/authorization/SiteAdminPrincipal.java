package gov.cdc.usds.simplereport.config.authorization;

import java.security.Principal;
import java.util.Objects;

/** A principal asserting that the bearer subject is a SimpleReport site administrator. */
public final class SiteAdminPrincipal implements Principal {
  public static final String NAME = "SITE_ADMIN";

  @Override
  public String getName() {
    return NAME;
  }

  @Override
  public boolean equals(Object obj) {
    return obj instanceof SiteAdminPrincipal;
  }

  @Override
  public int hashCode() {
    return Objects.hashCode(SiteAdminPrincipal.class);
  }
}
