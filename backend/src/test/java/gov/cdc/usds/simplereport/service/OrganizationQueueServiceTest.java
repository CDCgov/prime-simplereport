package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import gov.cdc.usds.simplereport.api.model.accountrequest.OrganizationAccountRequest;
import gov.cdc.usds.simplereport.db.model.OrganizationQueueItem;
import org.junit.jupiter.api.Test;

public class OrganizationQueueServiceTest extends BaseServiceTest<OrganizationQueueService> {
  @Test
  void queueNewRequest_newOrg_success() {
    String orgName = "My House";
    String orgExtId = "My-House-External-Id";
    String email = "fake@email.org";
    OrganizationQueueItem queueItem =
        _service.queueNewRequest(
            orgName,
            orgExtId,
            new OrganizationAccountRequest(
                "First", "Last", email, "800-555-1212", "CA", null, null));

    assertEquals(orgName, queueItem.getOrganizationName());
    assertEquals(orgExtId, queueItem.getExternalId());
    assertEquals(email, queueItem.getRequestData().getEmail());
  }
}
