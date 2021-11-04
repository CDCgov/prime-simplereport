package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.db.model.OrganizationQueueItem;
import gov.cdc.usds.simplereport.db.repository.OrganizationQueueRepository;
import gov.cdc.usds.simplereport.service.email.EmailProviderTemplate;
import gov.cdc.usds.simplereport.service.email.EmailService;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@Slf4j
public class ReminderService {

  private static final long LOCK_HOLD_MS = 1000L;

  private final OrganizationQueueRepository _orgQueueRepo;
  private final EmailService _emailService;

  public ReminderService(OrganizationQueueRepository orgQueueRepo, EmailService emailService) {
    _orgQueueRepo = orgQueueRepo;
    _emailService = emailService;
  }

  /*
   * Send reminder emails to complete identity verification to members of organizations that
   * were created and did not complete id verification
   */
  public Map<String, OrganizationQueueItem> sendAccountReminderEmails() {
    // take the advisory lock for this process. auto released after transaction
    if (_orgQueueRepo.tryOrgReminderLock()) {
      log.info("Reminder lock obtained: commencing email sending");
    } else {
      log.info("Reminders locked out by mutex: aborting");
      return new HashMap<>();
    }

    TimeZone tz = TimeZone.getTimeZone("America/New_York");
    LocalDate now = LocalDate.now(tz.toZoneId());

    // For now, the date range to consider is the previous day
    Date rangeStartDate = localDateTimeToDate(tz.toZoneId(), now.minusDays(1).atStartOfDay());
    Date rangeStopDate = localDateTimeToDate(tz.toZoneId(), now.atStartOfDay());

    log.info("CRON -- account reminder emails for {} - {}", rangeStartDate, rangeStopDate);

    List<OrganizationQueueItem> queueItems =
        _orgQueueRepo.findAllNotIdentityVerifiedByCreatedAtRange(rangeStartDate, rangeStopDate);

    Map<String, OrganizationQueueItem> orgReminderMap = new HashMap<>();

    for (OrganizationQueueItem queueItem : queueItems) {
      log.info("sending reminders for queued org: {}", queueItem.getExternalId());
      String orgAdminEmail = queueItem.getRequestData().getEmail();

      if (orgReminderMap.containsKey(orgAdminEmail)) {
        // in the queue, there can be repeated email addresses
        log.warn("Already sent id verification reminder email to: {}", orgAdminEmail);
        continue;
      }

      try {
        _emailService.sendWithDynamicTemplate(
            orgAdminEmail, EmailProviderTemplate.ORGANIZATION_ID_VERIFICATION_REMINDER);
      } catch (IOException e) {
        log.warn("Failed to send id verification reminder email to: {}", orgAdminEmail);
      }

      orgReminderMap.put(orgAdminEmail, queueItem);
    }

    try {
      // hold the lock a little extra so other instances have a chance to fail to acquire it
      Thread.sleep(LOCK_HOLD_MS);
    } catch (InterruptedException e) {
      log.debug("sendAccountReminderEmails: sleep interrupted");
      Thread.currentThread().interrupt();
    }

    return orgReminderMap;
  }

  private static Date localDateTimeToDate(ZoneId zoneId, LocalDateTime localDateTime) {
    return Date.from(localDateTime.atZone(zoneId).toInstant());
  }
}
