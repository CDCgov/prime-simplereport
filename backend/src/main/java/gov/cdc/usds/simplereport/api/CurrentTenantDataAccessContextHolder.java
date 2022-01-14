package gov.cdc.usds.simplereport.api;

import java.util.HashSet;
import java.util.Set;
import org.springframework.stereotype.Repository;
import org.springframework.web.context.annotation.RequestScope;

@Repository
@RequestScope
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
