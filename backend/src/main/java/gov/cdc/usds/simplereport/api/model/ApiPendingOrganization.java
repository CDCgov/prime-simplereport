package gov.cdc.usds.simplereport.api.model;

import gov.cdc.usds.simplereport.api.model.accountrequest.OrganizationAccountRequest;
import gov.cdc.usds.simplereport.db.model.OrganizationQueueItem;
import java.util.Date;
import lombok.Getter;

@Getter
public class ApiPendingOrganization {

  private String externalId;
  private String name;
  private String adminFirstName;
  private String adminLastName;
  private String adminEmail;
  private String adminPhone;
  private Date createdAt;

  public ApiPendingOrganization(OrganizationQueueItem org) {
    this.externalId = org.getExternalId();
    this.name = org.getOrganizationName();
    OrganizationAccountRequest accountRequest = org.getRequestData();
    this.adminFirstName = accountRequest.getFirstName();
    this.adminLastName = accountRequest.getLastName();
    this.adminEmail = accountRequest.getEmail();
    this.adminPhone = accountRequest.getWorkPhoneNumber();
    this.createdAt = org.getCreatedAt();
  }
}
