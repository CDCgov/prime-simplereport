package gov.cdc.usds.simplereport.db.model.auxiliary;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Set;

public class PermissionsData {
  private Set<String> authorities;

  @JsonCreator
  public PermissionsData(@JsonProperty("authorities") Set<String> authorities) {
    this.authorities = authorities;
  }

  public Set<String> getAuthorities() {
    return authorities;
  }
}
