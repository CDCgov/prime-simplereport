package gov.cdc.usds.simplereport.api;

import java.util.HashSet;
import java.util.Set;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.stereotype.Repository;
import org.springframework.web.context.WebApplicationContext;

@Repository
@Scope(scopeName = WebApplicationContext.SCOPE_REQUEST, proxyMode = ScopedProxyMode.TARGET_CLASS)
public class CurrentTenantDataAccessContextHolder {

  private String username;
  private Set<String> authorities = new HashSet<>();
  private boolean hasBeenPopulated = false;

  public void setTenantDataAccessAuthorities(String username, Set<String> authorities) {
    this.username = username;
    this.authorities = Set.copyOf(authorities);
    this.hasBeenPopulated = true;
  }

  public String getUsername() {
    return username;
  }

  public Set<String> getAuthorities() {
    return authorities;
  }

  public boolean hasBeenPopulated() {
    return hasBeenPopulated;
  }

  public void reset() {
    hasBeenPopulated = false;
    username = null;
    authorities = new HashSet<>();
  }
}
