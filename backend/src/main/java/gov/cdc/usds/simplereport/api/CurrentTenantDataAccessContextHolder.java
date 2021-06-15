package gov.cdc.usds.simplereport.api;

import java.util.Set;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.stereotype.Repository;
import org.springframework.web.context.WebApplicationContext;

@Repository
@Scope(scopeName = WebApplicationContext.SCOPE_REQUEST, proxyMode = ScopedProxyMode.TARGET_CLASS)
public class CurrentTenantDataAccessContextHolder {
  private String username;
  private Set<String> authorityNames;
  private boolean hasBeenPopulated = false;

  public void setTenantDataAccessAuthorities(String username, Set<String> authorityNames) {
    this.username = username;
    this.authorityNames = Set.copyOf(authorityNames);
    this.hasBeenPopulated = true;
  }

  public String getUsername() {
    return username;
  }

  public Set<String> getAuthorityNames() {
    return authorityNames;
  }

  public boolean hasBeenPopulated() {
    return hasBeenPopulated;
  }
}
