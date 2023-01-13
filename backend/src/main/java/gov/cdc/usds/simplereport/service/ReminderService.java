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
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@Slf4j
public class ReminderService {

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
//  @Scheduled(cron = "0 0 1 * * *", zone = "America/New_York")
//  @SchedulerLock(name = "ReminderService_sendAccountReminderEmails", lockAtLeastFor = "PT1S", lockAtMostFor = "PT30M")
  @Scheduled(fixedRate = 120000) // 2 min
  // lock longer than schedule to test that lock prevents scheduled method from running again until lock expires
  @SchedulerLock(name = "ReminderService_sendAccountReminderEmails", lockAtLeastFor = "PT3M", lockAtMostFor = "PT30M")
  @ConditionalOnProperty("simple-report.id-verification-reminders.enabled")
  public void sendAccountReminderEmails() {
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
  }

  private static Date localDateTimeToDate(ZoneId zoneId, LocalDateTime localDateTime) {
    return Date.from(localDateTime.atZone(zoneId).toInstant());
  }
}
