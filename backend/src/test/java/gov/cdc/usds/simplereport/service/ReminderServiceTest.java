package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.idp.repository.DemoOktaRepository;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;
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

  @Autowired private DemoOktaRepository _demoOktaRepo;
  @Autowired private JdbcTemplate _jdbc;

  @Test
  void sendAccountReminderEmails_noEmails_success() {
    Map<Organization, Set<String>> orgEmailsSent = _service.sendAccountReminderEmails();
    assertEquals(Set.of(), orgEmailsSent.keySet());
  }

  @Test
  void sendAccountReminderEmails_sendEmails_success() throws SQLException {
    String email = "fake@example.org";
    Organization unverifiedOrg = _dataFactory.createUnverifiedOrg();
    initAndBackdateUnverifiedOrg(unverifiedOrg, email);

    Map<Organization, Set<String>> orgEmailsSentMap = _service.sendAccountReminderEmails();
    assertEquals(1, orgEmailsSentMap.keySet().size());

    Organization remindedOrg = orgEmailsSentMap.keySet().iterator().next();
    assertEquals(unverifiedOrg.getExternalId(), remindedOrg.getExternalId());

    Set<String> remindedEmails = orgEmailsSentMap.get(remindedOrg);
    assertEquals(Set.of(email), remindedEmails);
  }

  @Test
  void sendAccountReminderEmails_concurrencyLock_success()
      throws InterruptedException, ExecutionException, SQLException {
    String email = "fake@example.org";
    Organization unverifiedOrg = _dataFactory.createUnverifiedOrg();
    initAndBackdateUnverifiedOrg(unverifiedOrg, email);

    int n = 3;
    List<Future<Map<Organization, Set<String>>>> futures = new ArrayList<>();

    ThreadPoolExecutor executor =
        new ThreadPoolExecutor(n, n, 1, TimeUnit.MINUTES, new ArrayBlockingQueue<>(n));

    for (int i = 0; i < n; i++) {
      Future<Map<Organization, Set<String>>> future =
          executor.submit(() -> _service.sendAccountReminderEmails());
      futures.add(future);
    }

    executor.shutdown();
    executor.awaitTermination(1, TimeUnit.MINUTES);

    assertEquals(n, futures.size());

    Map<Organization, Set<String>> successResult = null;
    int emptyResultCount = 0;

    for (Future<Map<Organization, Set<String>>> resultFuture : futures) {
      Map<Organization, Set<String>> result = resultFuture.get();
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

  void initAndBackdateUnverifiedOrg(Organization unverifiedOrg, String email) throws SQLException {
    backdateOrgCreatedAt(unverifiedOrg);

    // another unverified org, too new to be reminded
    _dataFactory.createValidOrg("Second Org Name", "k12", "SECOND_ORG_NAME", false);
    // verified org should not be reminded
    _dataFactory.createValidOrg();

    _demoOktaRepo.createUser(
        new IdentityAttributes(email, "First", "Middle", "Last", ""),
        unverifiedOrg,
        Set.of(),
        Set.of(OrganizationRole.NO_ACCESS, OrganizationRole.ADMIN),
        true);
  }

  @Transactional
  void backdateOrgCreatedAt(Organization org) throws SQLException {
    // Ugly, but avoids exposing createdAt to modification.  This backdates an organization's
    // created_at to noon gmt the previous day, which will fall in the range of times the id
    // verification reminder email will be sent to.
    String query =
        "UPDATE simple_report.organization SET created_at = (NOW() + AGE(NOW() AT TIME ZONE 'America/New_York', NOW()) - INTERVAL '1 DAY')::date + INTERVAL '12 hour' WHERE internal_id = ?";
    Connection conn = _jdbc.getDataSource().getConnection();
    PreparedStatement statement = conn.prepareStatement(query);
    statement.setObject(1, org.getInternalId());
    statement.execute();
  }
}
