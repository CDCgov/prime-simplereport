package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import gov.cdc.usds.simplereport.db.model.OrganizationQueueItem;
import gov.cdc.usds.simplereport.service.email.EmailProviderTemplate;
import gov.cdc.usds.simplereport.service.email.EmailService;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.Future;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

@TestPropertySource(properties = {"simple-report.id-verification-reminders.enabled=true"})
class ReminderServiceTest extends BaseServiceTest<ReminderService> {

  @Autowired private JdbcTemplate _jdbc;
  @MockBean private EmailService _emailService;

  @Test
  void sendAccountReminderEmails_noEmails_success() throws IOException {
    _service.sendAccountReminderEmails();
    verify(_emailService, never()).sendWithDynamicTemplate(anyString(), any());
  }

  @Test
  void sendAccountReminderEmails_sendEmails_success() throws SQLException, IOException {
    String email = "fake@example.org";
    OrganizationQueueItem unverifiedQueuedOrg =
        _dataFactory.saveOrganizationQueueItem("New Org Name", "NEW_ORG_NAME", email);
    initAndBackdateUnverifiedQueuedOrg(unverifiedQueuedOrg);

    // person submitted a second time (still only 1 email sent)
    OrganizationQueueItem unverifiedQueuedOrg2 =
        _dataFactory.saveOrganizationQueueItem("New Org Name", "NEW_ORG_NAME_AGAIN", email);
    backdateQueuedOrgCreatedAt(unverifiedQueuedOrg2);

    _service.sendAccountReminderEmails();
    verify(_emailService, times(1)).sendWithDynamicTemplate(anyString(), any());
    verify(_emailService, times(1))
        .sendWithDynamicTemplate(
            email, EmailProviderTemplate.ORGANIZATION_ID_VERIFICATION_REMINDER);
  }

  @Test
  void sendAccountReminderEmails_concurrencyLock_success()
      throws InterruptedException, SQLException, IOException {
    OrganizationQueueItem unverifiedQueuedOrg = _dataFactory.saveOrganizationQueueItem();
    initAndBackdateUnverifiedQueuedOrg(unverifiedQueuedOrg);

    int n = 3;
    List<Future<?>> futures = new ArrayList<>();

    ThreadPoolExecutor executor =
        new ThreadPoolExecutor(n, n, 1, TimeUnit.MINUTES, new ArrayBlockingQueue<>(n));

    for (int i = 0; i < n; i++) {
      Future<?> future = executor.submit(() -> _service.scheduledSendAccountReminderEmails());
      futures.add(future);
    }

    executor.shutdown();
    executor.awaitTermination(1, TimeUnit.MINUTES);

    assertEquals(n, futures.size());

    // verify only 1 email sent
    verify(_emailService, times(1)).sendWithDynamicTemplate(anyString(), any());
    verify(_emailService, times(1))
        .sendWithDynamicTemplate(
            "org.queue.admin@example.com",
            EmailProviderTemplate.ORGANIZATION_ID_VERIFICATION_REMINDER);
  }

  void initAndBackdateUnverifiedQueuedOrg(OrganizationQueueItem unverifiedQueuedOrg)
      throws SQLException {
    backdateQueuedOrgCreatedAt(unverifiedQueuedOrg);

    // another unverified org, too new to be reminded
    _dataFactory.saveOrganizationQueueItem(
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
    try (Connection conn = _jdbc.getDataSource().getConnection()) {
      PreparedStatement statement = conn.prepareStatement(query);
      statement.setObject(1, queuedOrg.getInternalId());
      statement.execute();
    }
  }
}
