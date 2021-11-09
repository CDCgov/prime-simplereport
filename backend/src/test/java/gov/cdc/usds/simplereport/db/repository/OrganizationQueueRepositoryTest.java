package gov.cdc.usds.simplereport.db.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import gov.cdc.usds.simplereport.api.model.accountrequest.OrganizationAccountRequest;
import gov.cdc.usds.simplereport.db.model.OrganizationQueueItem;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class OrganizationQueueRepositoryTest extends BaseRepositoryTest {

  @Autowired private OrganizationQueueRepository _repo;

  @Test
  void createAndFindQueueItem_success() {
    String orgName = "My House";
    String orgExtId = "My-House-External-Id";
    String email = "fake@email.org";
    addQueueItem(orgName, orgExtId, email);

    List<OrganizationQueueItem> unverifiedQueueItems = _repo.findAllNotIdentityVerified();
    assertEquals(1, unverifiedQueueItems.size());

    OrganizationQueueItem fetched = unverifiedQueueItems.get(0);
    assertEquals(orgName, fetched.getOrganizationName());
    assertEquals(orgExtId, fetched.getExternalId());
    assertEquals(email, fetched.getRequestData().getEmail());
  }

  @Test
  void findAllNotIdentityVerifiedByCreatedAtRange_success() {
    String orgName = "My House";
    String orgExtId = "My-House-External-Id";
    String email = "fake@email.org";
    addQueueItem(orgName, orgExtId, email);

    // inspect time window from 1 day ago to 1 day from now, queued item should be found
    LocalDateTime startLocalDate = LocalDateTime.now().minusDays(1);
    LocalDateTime stopLocalDate = startLocalDate.plusDays(2);

    List<OrganizationQueueItem> queueItems =
        _repo.findAllNotIdentityVerifiedByCreatedAtRange(
            Date.from(startLocalDate.atZone(ZoneId.systemDefault()).toInstant()),
            Date.from(stopLocalDate.atZone(ZoneId.systemDefault()).toInstant()));

    assertEquals(1, queueItems.size());
    assertEquals(orgExtId, queueItems.get(0).getExternalId());

    // shift the window back 2 days, queued item should not be found
    startLocalDate = startLocalDate.minusDays(2);
    stopLocalDate = stopLocalDate.minusDays(2);

    queueItems =
        _repo.findAllNotIdentityVerifiedByCreatedAtRange(
            Date.from(startLocalDate.atZone(ZoneId.systemDefault()).toInstant()),
            Date.from(stopLocalDate.atZone(ZoneId.systemDefault()).toInstant()));

    assertTrue(queueItems.isEmpty());
  }

  @Test
  void findUnverifiedByExternalId_success() {
    String orgName = "My House";
    String orgExtId = "My-House-External-Id";
    String email = "fake@email.org";
    addQueueItem(orgName, orgExtId, email);

    Optional<OrganizationQueueItem> optQueueItem = _repo.findUnverifiedByExternalId(orgExtId);

    assertTrue(optQueueItem.isPresent());
    assertEquals(orgExtId, optQueueItem.get().getExternalId());
  }

  void addQueueItem(String orgName, String orgExtId, String email) {
    OrganizationQueueItem saved =
        _repo.save(
            new OrganizationQueueItem(
                orgName,
                orgExtId,
                new OrganizationAccountRequest(
                    "First", "Last", email, "800-555-1212", "CA", null, null)));
    assertNotNull(saved);
    assertNotNull(saved.getInternalId());
  }
}
