package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.repository.OrganizationRepository;
import gov.cdc.usds.simplereport.idp.repository.OktaRepository;
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
import java.util.Set;
import java.util.TimeZone;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class ReminderService {

  private static final Logger LOG = LoggerFactory.getLogger(ReminderService.class);

  private final OktaRepository _oktaRepo;
  private final OrganizationRepository _orgRepo;
  private final EmailService _emailService;

  public ReminderService(
      OktaRepository oktaRepo, OrganizationRepository orgRepo, EmailService emailService) {
    _oktaRepo = oktaRepo;
    _orgRepo = orgRepo;
    _emailService = emailService;
  }

  /*
   * Send reminder emails to complete identity verification to members of organizations that
   * were created and did not complete id verification
   */
  public Map<Organization, Set<String>> sendAccountReminderEmails() {
    // take the advisory lock for this process. auto released after transaction
    if (_orgRepo.tryOrgReminderLock()) {
      LOG.info("Reminder lock obtained: commencing email sending");
    } else {
      LOG.info("Reminders locked out by mutex: aborting");
      return new HashMap<>();
    }

    TimeZone tz = TimeZone.getTimeZone("America/New_York");
    LocalDate now = LocalDate.now(tz.toZoneId());

    // For now, the date range to consider is the previous day
    Date rangeStartDate = localDateTimeToDate(tz.toZoneId(), now.minusDays(1).atStartOfDay());
    Date rangeStopDate = localDateTimeToDate(tz.toZoneId(), now.atStartOfDay());

    LOG.info("CRON -- account reminder emails for {} - {}", rangeStartDate, rangeStopDate);

    List<Organization> organizations =
        _orgRepo.findAllByIdentityVerifiedAndCreatedAtRange(false, rangeStartDate, rangeStopDate);

    Map<Organization, Set<String>> orgReminderMap = new HashMap<>();

    for (Organization org : organizations) {
      LOG.info("sending reminders for org: {}", org.getExternalId());

      // This could be problematic depending on the number of unverified organizations created
      // on the previous day.  It will make 2 requests to okta per organization.
      Set<String> emailsInOrg = _oktaRepo.getAllUsersForOrganization(org);

      if (emailsInOrg.isEmpty()) {
        LOG.info(
            "no emails sent: organization \"{}\" has no members in default group",
            org.getExternalId());
      }

      for (String email : emailsInOrg) {
        // unverified organizations will only have 1 associated email at this time
        try {
          _emailService.sendWithProviderTemplate(
              email, EmailProviderTemplate.ORGANIZATION_ID_VERIFICATION_REMINDER);
        } catch (IOException e) {
          LOG.warn("Failed to send id verification reminder email to: {}", email);
        }
      }

      orgReminderMap.put(org, emailsInOrg);
    }

    try {
      // hold the lock a little extra so other instances have a chance to fail to acquire it
      Thread.sleep(1L);
    } catch (InterruptedException e) {
      LOG.debug("sendAccountReminderEmails: sleep interrupted");
    }

    return orgReminderMap;
  }

  private static Date localDateTimeToDate(ZoneId zoneId, LocalDateTime localDateTime) {
    return Date.from(localDateTime.atZone(zoneId).toInstant());
  }
}
