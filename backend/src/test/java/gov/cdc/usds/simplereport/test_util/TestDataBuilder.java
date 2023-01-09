package gov.cdc.usds.simplereport.test_util;

import gov.cdc.usds.simplereport.api.model.accountrequest.OrganizationAccountRequest;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.OrganizationQueueItem;

public class TestDataBuilder {

  public static final String DEFAULT_ORG_ID = "MALLRAT";
  public static final String ALT_ORG_ID = "PLAZARAT";

  public static Organization buildOrg(
      String name, String type, String externalId, boolean identityVerified) {
    return new Organization(name, type, externalId, identityVerified);
  }

  public static Organization createValidOrganization() {
    return buildOrg("The Mall", "k12", DEFAULT_ORG_ID, true);
  }

  public static Organization createUnverifiedOrganization() {
    return buildOrg("The Plaza", "k12", ALT_ORG_ID, false);
  }

  public static OrganizationAccountRequest createOrganizationAccountRequest(String adminEmail) {
    return new OrganizationAccountRequest(
        "First", "Last", adminEmail, "800-555-1212", "CA", null, null);
  }

  public static OrganizationQueueItem buildOrganizationQueueItem(
      String orgName, String orgExternalId, String adminEmail) {
    return new OrganizationQueueItem(
        orgName, orgExternalId, createOrganizationAccountRequest(adminEmail));
  }

  public static OrganizationQueueItem createOrganizationQueueItem() {
    return buildOrganizationQueueItem(
        "New Org Queue Name", "CA-New-Org-Queue-Name-12345", "org.queue.admin@example.com");
  }
}
