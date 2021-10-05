package gov.cdc.usds.simplereport.api.model;

import gov.cdc.usds.simplereport.db.model.Organization;
import lombok.Getter;

@Getter
public class ApiPendingOrganization {

  private String name;
  private String adminName;
  private String adminEmail;
  private String adminPhone;

  public ApiPendingOrganization(Organization org, User adminUser) {
    this.name = org.getOrganizationName();
    this.adminName = adminUser.getName().toString();
    this.adminEmail = adminUser.getEmail();
    this.adminPhone = adminUser.get();
  }
}
