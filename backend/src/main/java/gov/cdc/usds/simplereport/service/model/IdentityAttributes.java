package gov.cdc.usds.simplereport.service.model;

import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import javax.validation.constraints.NotNull;
import org.springframework.boot.context.properties.ConstructorBinding;

/**
 * A container for all the attributes we extract from our OIDC token (initially just the username
 * and real name of the user, but eventually also security claims).
 */
public class IdentityAttributes extends PersonName {
  private String username;

  @ConstructorBinding
  public IdentityAttributes(
      String username, String firstName, String middleName, String lastName, String suffix) {
    super(firstName, middleName, lastName, suffix);
    this.username = username;
  }

  public IdentityAttributes(String username, @NotNull PersonName name) {
    this(username, name.getFirstName(), name.getMiddleName(), name.getLastName(), name.getSuffix());
  }

  public String getUsername() {
    return username;
  }
}
