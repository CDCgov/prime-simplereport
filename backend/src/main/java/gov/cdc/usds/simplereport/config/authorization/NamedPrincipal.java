package gov.cdc.usds.simplereport.config.authorization;

import java.security.Principal;

abstract class NamedPrincipal implements Principal {
  private final String name;

  NamedPrincipal(String name) {
    this.name = name;
  }

  @Override
  public String getName() {
    return name;
  }

  @Override
  public String toString() {
    return getName();
  }
}
