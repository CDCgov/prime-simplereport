package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.api.model.errors.DryRunException;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.repository.PatientAnswersRepository;
import gov.cdc.usds.simplereport.db.repository.PersonRepository;
import gov.cdc.usds.simplereport.db.repository.PhoneNumberRepository;
import gov.cdc.usds.simplereport.db.repository.ReportStreamResponseRepository;
import gov.cdc.usds.simplereport.db.repository.ResultRepository;
import gov.cdc.usds.simplereport.db.repository.ResultUploadErrorRepository;
import gov.cdc.usds.simplereport.db.repository.TestEventRepository;
import gov.cdc.usds.simplereport.db.repository.TestResultUploadRepository;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.TimeZone;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@Slf4j
public class DataRetentionService {

  private final PersonRepository personRepository;
  private final TestEventRepository testEventRepository;
  private final ResultRepository resultRepository;
  private final PatientAnswersRepository patientAnswersRepository;
  private final TestResultUploadRepository testResultUploadRepository;
  private final ResultUploadErrorRepository resultUploadErrorRepository;
  private final PhoneNumberRepository phoneNumberRepository;
  private final ReportStreamResponseRepository reportStreamResponseRepository;

  @Value("${simple-report.data-retention.enabled:false}")
  private boolean dataRetentionEnabled;

  @Value("${simple-report.data-retention.retention-days:30}")
  private int retentionDays;

  @Value("${simple-report.data-retention.batch-size:1000}")
  private int batchSize;

  @Value("${simple-report.data-retention.max-execution-time-minutes:120}")
  private int maxExecutionTimeMinutes;

  private static final int MILLISECONDS_PER_MINUTE = 60000;

  public DataRetentionService(
      PersonRepository personRepository,
      TestEventRepository testEventRepository,
      ResultRepository resultRepository,
      PatientAnswersRepository patientAnswersRepository,
      TestResultUploadRepository testResultUploadRepository,
      ResultUploadErrorRepository resultUploadErrorRepository,
      PhoneNumberRepository phoneNumberRepository,
      ReportStreamResponseRepository reportStreamResponseRepository) {
    this.personRepository = personRepository;
    this.testEventRepository = testEventRepository;
    this.resultRepository = resultRepository;
    this.patientAnswersRepository = patientAnswersRepository;
    this.testResultUploadRepository = testResultUploadRepository;
    this.resultUploadErrorRepository = resultUploadErrorRepository;
    this.phoneNumberRepository = phoneNumberRepository;
    this.reportStreamResponseRepository = reportStreamResponseRepository;
  }

  /** Daily scheduled job - Runs at 2 AM Eastern Time */
  @Scheduled(cron = "0 0 2 * * *", zone = "America/New_York")
  @SchedulerLock(
      name = "DataRetentionService_deleteOldData",
      lockAtLeastFor = "PT30S",
      lockAtMostFor = "PT150M")
  public void scheduledDeleteOldData() {
    if (!dataRetentionEnabled) {
      log.info("Data retention job is disabled - skipping scheduled deletion");
      return;
    }

    log.info(
        "Starting scheduled data retention job - deleting data older than {} days", retentionDays);
    long startTime = System.currentTimeMillis();

    try {
      deleteOldData(false);
      long executionTime = System.currentTimeMillis() - startTime;
      log.info(
          "Data retention job completed successfully in {} ms ({} minutes)",
          executionTime,
          executionTime / MILLISECONDS_PER_MINUTE);

      // Log structured data for App Insights monitoring
      log.info(
          "DataRetentionJob_Success: duration_ms={}, retention_days={}, batch_size={}",
          executionTime,
          retentionDays,
          batchSize);

    } catch (IllegalArgumentException | IllegalStateException e) {
      long executionTime = System.currentTimeMillis() - startTime;
      log.error(
          "Data retention job failed after {} ms ({} minutes) with error: {}",
          executionTime,
          executionTime / MILLISECONDS_PER_MINUTE,
          e.getMessage(),
          e);

      log.error(
          "DataRetentionJob_Failed: duration_ms={}, retention_days={}, batch_size={}, error_type={}, error_message={}",
          executionTime,
          retentionDays,
          batchSize,
          e.getClass().getSimpleName(),
          e.getMessage());
    }
  }

  /** Placeholder method for actual deletion logic */
  @Transactional
  @AuthorizationConfiguration.RequireGlobalAdminUser
  public void deleteOldData(boolean dryRun) {
    TimeZone tz = TimeZone.getTimeZone("America/New_York");
    LocalDate now = LocalDate.now(tz.toZoneId());
    //        LocalDate cutoffDate = now.minusDays(retentionDays);
    Date cutoffDate =
        Date.from(
            LocalDate.now()
                .minusDays(retentionDays)
                .atStartOfDay(ZoneId.systemDefault())
                .toInstant());

    log.info(
        "Data retention job starting - cutoff date: {}, batch size: {}, max execution time: {} minutes",
        cutoffDate,
        batchSize,
        maxExecutionTimeMinutes);

    // PLACEHOLDER: Replace with actual deletion logic in future ticket
    log.info("PLACEHOLDER: Would delete patient and test data older than {}", cutoffDate);

    // nothing to delete or update in test_order
    // in test_event table, if older than 30 days, delete patient_data, survey_data,
    // patient_has_prior_tests, add "archive" column and set to true?
    // in Result table, if older than 30 days, delete result and test_result columns
    // in patient_answers table, delete ask_on entry if older than 30 days
    // in patient table, filter out patients that were created within the last 30 days. For the
    // remaining patients,
    // find their most recent test event. if it's older than 30 days, i.e. it's archived, then
    // update the relevant patient values and cascade delete
    // alternatively, look at whether all of their test events are archived. if they're all
    // archived, then update the relevant patient values

    // update all test_event older than 30 days to be archived=true
    // get all test_event within the last 30 days ->
    // get the set of patient_id,
    // get the set of test_order_id
    // update any test_event that aren't in that list
    // update any patients that aren't in that list
    // update any test_order that aren't in that list
    //        Date cutoffDate = new Date(
    //                System.currentTimeMillis() - (cutoffDays * 24L * 60 * 60 * 1000)
    //        );

    // log time it takes to run each query, put in as much observability as possible before running
    // in dev
    // practice restoring DB from backup with Shanice
    testEventRepository.deletePiiForTestEventIfTestOrderHasNoTestEventsUpdatedAfter(cutoffDate);

    resultRepository.deletePiiForResultIfTestOrderHasNoTestEventsUpdatedAfter(cutoffDate);

    patientAnswersRepository.deletePiiForPatientAnswersIfTestOrderHasNoTestEventsUpdatedAfter(
        cutoffDate);

    personRepository.deletePiiForPatientsWhoHaveNoTestEventsAfter(cutoffDate);

    phoneNumberRepository.deletePiiForPhoneNumbersForPatientsCreatedBeforeAndHaveNoTestEventsAfter(
        cutoffDate);

    testResultUploadRepository.deletePiiForBulkTestResultUploadsLastUpdatedBefore(cutoffDate);

    resultUploadErrorRepository.deletePiiForResultUploadErrorsLastUpdatedBefore(
        cutoffDate); // works, but need to populate to test all the way

    reportStreamResponseRepository
        .deletePiiForReportStreamResponseIfTestOrderHasNoTestEventsUpdatedAfter(cutoffDate);

    // make a record of how many rows had pii_deleted for each table?

    log.info(
        "DataRetentionJob_PlaceholderComplete: cutoff_date={}, batch_size={}",
        cutoffDate,
        batchSize);

    if (dryRun) {
      throw new DryRunException("Dry run, rolling back");
    }
  }
}
