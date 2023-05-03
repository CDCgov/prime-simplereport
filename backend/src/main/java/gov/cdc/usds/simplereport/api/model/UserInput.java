package gov.cdc.usds.simplereport.api.model;

import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserInput {
  PersonName name;
  private String firstName;
  private String middleName;
  private String lastName;
  private String suffix;
  private String email;
  private String organizationExternalId;
  private Role role;
}
