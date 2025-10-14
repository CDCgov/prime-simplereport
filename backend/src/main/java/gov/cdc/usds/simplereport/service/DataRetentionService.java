package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.api.model.errors.DryRunException;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.config.FeatureFlagsConfig;
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
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
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
  private final FeatureFlagsConfig featureFlagsConfig;

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
      ReportStreamResponseRepository reportStreamResponseRepository,
      FeatureFlagsConfig featureFlagsConfig) {
    this.personRepository = personRepository;
    this.testEventRepository = testEventRepository;
    this.resultRepository = resultRepository;
    this.patientAnswersRepository = patientAnswersRepository;
    this.testResultUploadRepository = testResultUploadRepository;
    this.resultUploadErrorRepository = resultUploadErrorRepository;
    this.phoneNumberRepository = phoneNumberRepository;
    this.reportStreamResponseRepository = reportStreamResponseRepository;
    this.featureFlagsConfig = featureFlagsConfig;
  }

  /** Daily scheduled job - Runs at 2 AM Eastern Time */
  @Scheduled(cron = "0 0 2 * * *", zone = "America/New_York")
  //  @Scheduled(cron = "0 * * * * *", zone = "America/New_York")
  @SchedulerLock(
      name = "DataRetentionService_deleteOldData",
      lockAtLeastFor = "PT30S",
      lockAtMostFor = "PT150M")
  @Transactional
  public void scheduledDeleteOldPii() {
    if (!featureFlagsConfig.isDataRetentionLimitsEnabled()) {
      log.info("Data retention job is disabled - skipping scheduled deletion");
      return;
    }

    log.info(
        "Starting scheduled data retention job - deleting PII older than {} days", retentionDays);
    long startTime = System.currentTimeMillis();

    try {
      deleteOldPii(false);
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
      // In a @Transactional method, caught exceptions do not trigger rollback by default,
      // need to rethrow to trigger rollback
      throw e;
    }
  }

  /** Clears PII from database */
  @Transactional
  @AuthorizationConfiguration.RequireGlobalAdminUser
  public void deleteOldPii(boolean dryRun) {
    Date cutoffDate =
        Date.from(
            LocalDate.now()
                .minusDays(retentionDays)
                .atStartOfDay(ZoneId.systemDefault())
                .toInstant());

    // practice restoring DB from backup with Shanice

    long testEventStartTime = System.currentTimeMillis();
    testEventRepository.deletePiiForTestEventIfTestOrderHasNoTestEventsUpdatedAfter(cutoffDate);
    long testEventExecutionTime = System.currentTimeMillis() - testEventStartTime;
    log.info(
        "TestEvent PII deleted successfully in {} ms ({} minutes)",
        testEventExecutionTime,
        testEventExecutionTime / MILLISECONDS_PER_MINUTE);

    long resultStartTime = System.currentTimeMillis();
    resultRepository.deletePiiForResultTiedToTestEventIfTestOrderHasNoTestEventsUpdatedAfter(
        cutoffDate);
    resultRepository.deletePiiForResultTiedToTestOrderIfTestOrderHasNoTestEventsUpdatedAfter(
        cutoffDate);
    long resultExecutionTime = System.currentTimeMillis() - resultStartTime;
    log.info(
        "Result PII deleted successfully in {} ms ({} minutes)",
        resultExecutionTime,
        resultExecutionTime / MILLISECONDS_PER_MINUTE);

    long patientAnswersStartTime = System.currentTimeMillis();
    patientAnswersRepository.deletePiiForPatientAnswersIfTestOrderHasNoTestEventsUpdatedAfter(
        cutoffDate);
    long patientAnswersExecutionTime = System.currentTimeMillis() - patientAnswersStartTime;
    log.info(
        "PatientAnswers PII deleted successfully in {} ms ({} minutes)",
        patientAnswersExecutionTime,
        patientAnswersExecutionTime / MILLISECONDS_PER_MINUTE);

    long personStartTime = System.currentTimeMillis();
    personRepository.deletePiiForPatientsWhoHaveNoTestEventsAfter(cutoffDate);
    long personExecutionTime = System.currentTimeMillis() - personStartTime;
    log.info(
        "Person PII deleted successfully in {} ms ({} minutes)",
        personExecutionTime,
        personExecutionTime / MILLISECONDS_PER_MINUTE);

    long phoneNumberStartTime = System.currentTimeMillis();
    phoneNumberRepository.deletePiiForPhoneNumbersForPatientsCreatedBeforeAndHaveNoTestEventsAfter(
        cutoffDate);
    long phoneNumberExecutionTime = System.currentTimeMillis() - phoneNumberStartTime;
    log.info(
        "PhoneNumber PII deleted successfully in {} ms ({} minutes)",
        phoneNumberExecutionTime,
        phoneNumberExecutionTime / MILLISECONDS_PER_MINUTE);

    long testResultUploadStartTime = System.currentTimeMillis();
    testResultUploadRepository.deletePiiForBulkTestResultUploadsLastUpdatedBefore(cutoffDate);
    long testResultUploadExecutionTime = System.currentTimeMillis() - testResultUploadStartTime;
    log.info(
        "TestResultUpload PII deleted successfully in {} ms ({} minutes)",
        testResultUploadExecutionTime,
        testResultUploadExecutionTime / MILLISECONDS_PER_MINUTE);

    long resultUploadErrorStartTime = System.currentTimeMillis();
    resultUploadErrorRepository.deletePiiForResultUploadErrorsLastUpdatedBefore(
        cutoffDate); // works, but need to populate to test all the way
    long resultUploadErrorExecutionTime = System.currentTimeMillis() - resultUploadErrorStartTime;
    log.info(
        "ResultUploadError PII deleted successfully in {} ms ({} minutes)",
        resultUploadErrorExecutionTime,
        resultUploadErrorExecutionTime / MILLISECONDS_PER_MINUTE);

    long reportStreamResponseStartTime = System.currentTimeMillis();
    reportStreamResponseRepository
        .deletePiiForReportStreamResponseIfTestOrderHasNoTestEventsUpdatedAfter(cutoffDate);
    long reportStreamResponseExecutionTime =
        System.currentTimeMillis() - reportStreamResponseStartTime;
    log.info(
        "ReportStreamResponse PII deleted successfully in {} ms ({} minutes)",
        reportStreamResponseExecutionTime,
        reportStreamResponseExecutionTime / MILLISECONDS_PER_MINUTE);

    // make a record of how many rows had pii_deleted for each table?

    if (dryRun) {
      throw new DryRunException("Dry run, rolling back");
    }
  }
}
