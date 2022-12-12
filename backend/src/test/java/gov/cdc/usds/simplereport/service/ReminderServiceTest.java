package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import gov.cdc.usds.simplereport.db.model.OrganizationQueueItem;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

class ReminderServiceTest extends BaseServiceTest<ReminderService> {

  @Autowired private JdbcTemplate _jdbc;

  @Test
  void sendAccountReminderEmails_noEmails_success() {
    Map<String, OrganizationQueueItem> orgEmailsSent = _service.sendAccountReminderEmails();
    assertEquals(Set.of(), orgEmailsSent.keySet());
  }

  @Test
  void sendAccountReminderEmails_sendEmails_success() throws SQLException {
    String email = "fake@example.org";
    OrganizationQueueItem unverifiedQueuedOrg =
        _dataFactory.createOrganizationQueueItem("New Org Name", "NEW_ORG_NAME", email);
    initAndBackdateUnverifiedQueuedOrg(unverifiedQueuedOrg);

    // person submitted a second time (still only 1 email sent)
    OrganizationQueueItem unverifiedQueuedOrg2 =
        _dataFactory.createOrganizationQueueItem("New Org Name", "NEW_ORG_NAME_AGAIN", email);
    backdateQueuedOrgCreatedAt(unverifiedQueuedOrg2);

    Map<String, OrganizationQueueItem> orgEmailsSentMap = _service.sendAccountReminderEmails();
    assertEquals(1, orgEmailsSentMap.keySet().size());

    String remindedEmail = orgEmailsSentMap.keySet().iterator().next();
    assertEquals(email, remindedEmail);

    OrganizationQueueItem remindedOrg = orgEmailsSentMap.get(remindedEmail);
    assertEquals(unverifiedQueuedOrg.getExternalId(), remindedOrg.getExternalId());
  }

  @Test
  void sendAccountReminderEmails_concurrencyLock_success()
      throws InterruptedException, ExecutionException, SQLException {
    OrganizationQueueItem unverifiedQueuedOrg = _dataFactory.createOrganizationQueueItem();
    initAndBackdateUnverifiedQueuedOrg(unverifiedQueuedOrg);

    int n = 3;
    List<Future<Map<String, OrganizationQueueItem>>> futures = new ArrayList<>();

    ThreadPoolExecutor executor =
        new ThreadPoolExecutor(n, n, 1, TimeUnit.MINUTES, new ArrayBlockingQueue<>(n));

    for (int i = 0; i < n; i++) {
      Future<Map<String, OrganizationQueueItem>> future =
          executor.submit(() -> _service.sendAccountReminderEmails());
      futures.add(future);
    }

    executor.shutdown();
    executor.awaitTermination(1, TimeUnit.MINUTES);

    assertEquals(n, futures.size());

    Map<String, OrganizationQueueItem> successResult = null;
    int emptyResultCount = 0;

    for (Future<Map<String, OrganizationQueueItem>> resultFuture : futures) {
      Map<String, OrganizationQueueItem> result = resultFuture.get();
      if (result.keySet().size() > 0) {
        successResult = result;
      } else {
        emptyResultCount++;
      }
    }

    // expect:
    //   * 1 result with 1 key (the one that got the lock)
    assertNotNull(successResult);
    assertEquals(1, successResult.keySet().size());
    //   * n-1 results with empty key set
    assertEquals(n - 1, emptyResultCount);
  }

  void initAndBackdateUnverifiedQueuedOrg(OrganizationQueueItem unverifiedQueuedOrg)
      throws SQLException {
    backdateQueuedOrgCreatedAt(unverifiedQueuedOrg);

    // another unverified org, too new to be reminded
    _dataFactory.createOrganizationQueueItem(
        "Second Org Name", "SECOND_ORG_NAME", "second.org.email@example.com");
    // verified org should not be reminded
    _dataFactory.createVerifiedOrganizationQueueItem(
        "Verified Org", "A_VERIFIED_ORG", "verifiedorgemail@example.com");
  }

  @Transactional
  void backdateQueuedOrgCreatedAt(OrganizationQueueItem queuedOrg) throws SQLException {
    // Ugly, but avoids exposing createdAt to modification.  This backdates an organization's
    // created_at to noon gmt the previous day, which will fall in the range of times the id
    // verification reminder email will be sent to.
    String query =
        "UPDATE simple_report.organization_queue SET created_at = (NOW() + AGE(NOW() AT TIME ZONE 'America/New_York', NOW()) - INTERVAL '1 DAY')::date + INTERVAL '12 hour' WHERE internal_id = ?";
    Connection conn = _jdbc.getDataSource().getConnection();
    PreparedStatement statement = conn.prepareStatement(query);
    statement.setObject(1, queuedOrg.getInternalId());
    statement.execute();
  }
}
