package gov.cdc.usds.simplereport.config.authorization;

/** A principal asserting that the bearer subject is a SimpleReport site administrator. */
public final class SiteAdminPrincipal extends NamedPrincipal {
  private static final SiteAdminPrincipal INSTANCE = new SiteAdminPrincipal();

  private SiteAdminPrincipal() {
    super("SITE_ADMIN");
  }

  public static SiteAdminPrincipal getInstance() {
    return INSTANCE;
  }
}
