package gov.cdc.usds.simplereport.api.model;

import com.okta.sdk.resource.user.User;
import com.okta.sdk.resource.user.UserProfile;
import gov.cdc.usds.simplereport.api.model.accountrequest.OrganizationAccountRequest;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.OrganizationQueueItem;
import lombok.Getter;

@Getter
public class ApiPendingOrganization {

  private String externalId;
  private String name;
  private String adminName;
  private String adminEmail;
  private String adminPhone;
  private Date createdAt;

  public ApiPendingOrganization(Organization org, User adminUser) {
    this.externalId = org.getExternalId();
    this.name = org.getOrganizationName();
    UserProfile profile = adminUser.getProfile();
    this.adminName = profile.getFirstName() + " " + profile.getLastName();
    this.adminEmail = profile.getEmail();
    this.adminPhone = profile.getPrimaryPhone();
    this.createdAt = org.getCreatedAt();
  }

  public ApiPendingOrganization(OrganizationQueueItem org) {
    this.externalId = org.getExternalId();
    this.name = org.getOrganizationName();
    OrganizationAccountRequest accountRequest = org.getRequestData();
    this.adminName = accountRequest.getFirstName() + " " + accountRequest.getLastName();
    this.adminEmail = accountRequest.getEmail();
    this.adminPhone = accountRequest.getWorkPhoneNumber();
    this.createdAt = org.getCreatedAt();
  }
}
